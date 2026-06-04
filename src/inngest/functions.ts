import { inngest } from "./client";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getAdminDb, getAdminStorage } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

// --- MIME type helper ---
const MIME_MAP: Record<string, string> = {
  pdf: "application/pdf",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

function getMimeType(fileName: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase() || "";
  return MIME_MAP[ext] || "application/pdf";
}

// --- Shared Extraction Logic ---
async function performExtraction(
  step: any,
  fileName: string,
  fileUrl: string,
  templateFields: string[],
  batchJobId: string,
  userId: string
) {
  // STEP 1: Durable Save Point — Extract data from Gemini
  const extractedFields = await step.run("extract-from-gemini", async () => {
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error(`Failed to download "${fileName}": ${response.status} ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString("base64");
    const mimeType = getMimeType(fileName);

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY not configured");

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = templateFields.length > 0
      ? `
        ### ROLE
        You are a Precision Financial Auditor specializing in Document Information Extraction (DIE). 
        Your task is to extract data from this document with 100% accuracy.

        ### FIELDS TO EXTRACT
        ${templateFields.map((f: string) => `- ${f}`).join("\n")}

        ### EXTRACTION RULES
        1. **Context Awareness**: Identify the 'Vendor' (who issued the bill) vs 'Customer' (who pays the bill).
        - Customer Name (the recipient of the goods/services, often listed under 'Bill To' or 'Buyer')  
        2. **No Hallucinations**: If a field is not explicitly printed on the document, return "". Do not guess.
        3. **Format**: Clean all currency symbols (e.g., "$", "₹") and return only the numeric value for totals.
        4. **Dates**: Standardize all dates to YYYY-MM-DD.

        ### OUTPUT
        Return ONLY a strict, valid JSON object. No markdown formatting, no conversational filler.
    `
      : `
        ### ROLE
        You are a Precision Financial Auditor. Auto-detect all critical financial metadata.

        ### INSTRUCTIONS
        - Extract: Invoice Number, Date, Vendor Name, Customer Name, GSTIN/Tax ID, Taxable Value, Tax Amount, and Grand Total.
        - Detect any additional line items if present.
        - Return ONLY a strict JSON object with flat key-value pairs.
        - Use "snake_case" for auto-detected keys.
    `;

    const result = await model.generateContent([
      prompt,
      { inlineData: { data: base64Data, mimeType } },
    ]);

    const text = result.response.text();
    const cleanJson = text.replace(/```json\n?|\n?```/g, "").trim();
    return JSON.parse(cleanJson);
  });

  // STEP 2: Durable Save Point — Save results to Firestore
  await step.run("save-results-to-firestore", async () => {
    const batchJobRef = getAdminDb()
      .collection("users")
      .doc(userId)
      .collection("batchJobs")
      .doc(batchJobId);

    // Atomically: increment completedFiles + append this file's result
    await batchJobRef.update({
      completedFiles: FieldValue.increment(1),
      results: FieldValue.arrayUnion({
        fileName,
        status: "Success",
        fields: extractedFields,
      }),
    });

    // Check if batch is complete
    const updatedDoc = await batchJobRef.get();
    const data = updatedDoc.data();
    if (data && data.completedFiles >= data.totalFiles) {
      await batchJobRef.update({ status: "completed" });
    }
  });

  return extractedFields;
}

// --- The Workers ---

// Free Tier Worker: Slow (Concurrency 1, 5s artificial sleep)
export const processFileFree = inngest.createFunction(
  {
    id: "finflow-process-file-free",
    concurrency: { limit: 1 }, // Strictly one by one
    retries: 3,
    triggers: { event: "finflow/file.process.free" },
  },
  async ({ event, step }) => {
    const { fileName, fileUrl, templateFields, batchJobId, userId } = event.data;
    
    // Artificial velocity throttle for free users
    await step.sleep("velocity-throttle", "5s");
    
    const extractedFields = await performExtraction(step, fileName, fileUrl, templateFields, batchJobId, userId);
    return { success: true, fileName, fields: extractedFields, tier: "free" };
  }
);

// Pro Tier Worker: Lightning Fast (Concurrency 15)
export const processFilePro = inngest.createFunction(
  {
    id: "finflow-process-file-pro",
    concurrency: { limit: 5 }, // Process 5 in parallel (Inngest plan limit)
    retries: 3,
    triggers: { event: "finflow/file.process.pro" },
  },
  async ({ event, step }) => {
    const { fileName, fileUrl, templateFields, batchJobId, userId } = event.data;
    
    const extractedFields = await performExtraction(step, fileName, fileUrl, templateFields, batchJobId, userId);
    
    // Cooldown to avoid Gemini 429 limits even for Pro
    await step.sleep("gemini-cooldown", "2s");
    
    return { success: true, fileName, fields: extractedFields, tier: "pro" };
  }
);

// --- 7-Day Ephemerality Cron Job ---
export const cleanupFreeTierData = inngest.createFunction(
  {
    id: "cleanup-free-tier-data",
    triggers: [{ cron: "0 0 * * *" }], // Run at midnight every day
  },
  async ({ step }) => {
    const bucket = getAdminStorage().bucket();

    // 1. Get all Free users
    const freeUsers = await step.run("fetch-free-users", async () => {
      const statsSnapshot = await getAdminDb()
        .collectionGroup("stats")
        .where("subscriptionTier", "==", "Free")
        .get();

      // The path is users/{uid}/stats/stats (or similar). We need the uid.
      return statsSnapshot.docs.map((doc: any) => {
        // Document path is usually users/{userId}/stats/{docId} OR users/{userId} (if stats is flat)
        // In this app, useFirestore.ts uses: doc(db, "users", user.uid, "stats", "default")
        return doc.ref.parent.parent?.id; 
      }).filter(Boolean) as string[];
    });

    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
    const cutoffDate = new Date(Date.now() - SEVEN_DAYS_MS);

    // 2. Clean up each free user's data
    for (const uid of freeUsers) {
      await step.run(`cleanup-user-${uid}`, async () => {
        
        // A. Delete old processed exports (Excel files)
        const exportsSnapshot = await getAdminDb()
          .collection(`users/${uid}/processedExports`)
          .where("createdAt", "<=", cutoffDate)
          .get();

        for (const doc of exportsSnapshot.docs) {
          const data = doc.data();
          if (data.storagePath) {
            try { await bucket.file(data.storagePath).delete(); } catch (e) {} // ignore if not found
          }
          await doc.ref.delete();
        }

        // B. Delete old user files (Uploaded PDFs)
        const filesSnapshot = await getAdminDb()
          .collection(`users/${uid}/files`)
          .where("createdAt", "<=", cutoffDate)
          .get();

        for (const doc of filesSnapshot.docs) {
          const data = doc.data();
          if (data.storagePath) {
            try { await bucket.file(data.storagePath).delete(); } catch (e) {} 
          }
          await doc.ref.delete();
        }

        // C. Delete old batch jobs (Raw JSON Results)
        const jobsSnapshot = await getAdminDb()
          .collection(`users/${uid}/batchJobs`)
          .where("createdAt", "<=", cutoffDate)
          .get();

        for (const doc of jobsSnapshot.docs) {
          await doc.ref.delete();
        }
      });
    }

    return { success: true, processedUsers: freeUsers.length };
  }
);
