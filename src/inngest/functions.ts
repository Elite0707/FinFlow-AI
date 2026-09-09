import { inngest } from "./client";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getAdminDb, getAdminStorage } from "@/lib/firebaseAdmin";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import ExcelJS from "exceljs";
import crypto from "crypto";

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
           - Vendor Name = the company at the TOP of the invoice (the seller/issuer).
           - Customer Name = the recipient, found under 'Bill To', 'To', 'M/S', 'Buyer', or 'Ship To'.
        2. **GSTIN Rule**: When "GSTIN" is requested, extract the **CUSTOMER's (buyer's) GSTIN**, 
           NOT the vendor's GSTIN. The customer GSTIN is typically found near the "Bill To" / 
           "Ship To" section. The vendor GSTIN at the top of the invoice belongs to the seller — ignore it for this field.
        3. **No Hallucinations**: If a field is not explicitly printed on the document, return "". Do not guess.
        4. **Format**: Clean all currency symbols (e.g., "$", "₹") and return only the numeric value for totals.
        5. **Dates**: Standardize all dates to YYYY-MM-DD.

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
      // 1. Generate Excel workbook
      const workbook = new ExcelJS.Workbook();
      const results = data.results || [];
      const templateFields = data.templateFields || [];
      const templateName = data.templateName || "Template";

      // Group the data by vendor/party name
      const groupKey = templateFields.find((f: string) =>
        /vendor|company|party|name|customer|client|buyer/i.test(f)
      );

      const groupedData: Record<string, any[]> = {};
      results.forEach((row: any) => {
        if (row.status !== "Success") return;

        let companyName = "";
        if (groupKey) {
          const fields = row.fields || {};
          if (fields[groupKey] && fields[groupKey] !== "" && fields[groupKey] !== "Not Found") {
            companyName = fields[groupKey];
          } else {
            const matchingKey = Object.keys(fields).find(
              (k) => k.toLowerCase() === groupKey.toLowerCase()
            );
            if (matchingKey && fields[matchingKey] && fields[matchingKey] !== "" && fields[matchingKey] !== "Not Found") {
              companyName = fields[matchingKey];
            }
          }
        }

        if (!companyName) {
          companyName = row.fileName
            ? row.fileName.replace(/\.[^/.]+$/, "")
            : "Uncategorized";
        }

        if (!groupedData[companyName]) groupedData[companyName] = [];
        groupedData[companyName].push(row);
      });

      const companyNames = Object.keys(groupedData);

      const indexSheet = workbook.addWorksheet("Index");
      indexSheet.addRow(["", "INDEX", ""]);
      indexSheet.addRow(["SR NO", "NAME", "PAGE NO"]);
      indexSheet.getRow(1).font = { bold: true, size: 14 };
      indexSheet.getRow(2).font = { bold: true };
      indexSheet.columns = [
        { width: 10 }, { width: 45 }, { width: 15 }
      ];

      companyNames.forEach((company, index) => {
        const pageNo = (index + 1).toString();

        const iRow = indexSheet.addRow([pageNo, company, pageNo]);
        iRow.getCell(3).value = { text: pageNo, hyperlink: `#'${pageNo}'!A1` } as any;
        iRow.getCell(3).font = { color: { argb: "0563C1" }, underline: true };

        const sheet = workbook.addWorksheet(pageNo);
        const colWidths = templateFields.map((f: string) => ({
          width: Math.max(15, Math.min(40, f.length * 1.5 + 5))
        }));
        sheet.columns = colWidths;

        sheet.addRow([`NAME  :---`, company, ...Array(Math.max(0, templateFields.length - 2)).fill("")]);
        sheet.addRow(Array(templateFields.length).fill(""));

        const headerRow = sheet.addRow(templateFields);
        headerRow.font = { bold: true };
        headerRow.eachCell((cell) => {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFE2EFDA" }
          };
          cell.border = {
            bottom: { style: "thin", color: { argb: "FF999999" } }
          };
        });
        sheet.getRow(1).font = { bold: true };

        groupedData[company].forEach((dataRow) => {
          const rowValues = templateFields.map((field: string) => {
            const fields = dataRow.fields || {};
            if (fields[field] !== undefined) return fields[field];
            const key = Object.keys(fields).find((k) => k.toLowerCase() === field.toLowerCase());
            return key ? fields[key] : "";
          });
          sheet.addRow(rowValues);
        });
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const dateStr = new Date().toISOString().slice(0, 10);
      const outputFileName = `${templateName.replace(/\s+/g, "_")}_Ledger_${dateStr}.xlsx`;

      // 2. Upload to Firebase Storage using Admin SDK
      const exportTimestamp = Date.now();
      const storagePath = `user_exports/${userId}/${exportTimestamp}_${outputFileName}`;
      const bucket = getAdminStorage().bucket();
      const fileRef = bucket.file(storagePath);

      const downloadToken = crypto.randomUUID();
      await fileRef.save(Buffer.from(buffer), {
        metadata: {
          contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          contentDisposition: `attachment; filename="${outputFileName}"`,
          metadata: {
            firebaseStorageDownloadTokens: downloadToken
          }
        }
      });

      const downloadURL = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(storagePath)}?alt=media&token=${downloadToken}`;

      // 3. Save reference to processedExports Firestore collection
      await getAdminDb()
        .collection("users")
        .doc(userId)
        .collection("processedExports")
        .add({
          fileName: outputFileName,
          templateName,
          downloadURL,
          storagePath,
          fileCount: data.totalFiles,
          createdAt: FieldValue.serverTimestamp()
        });

      // 4. Update batchJob document
      await batchJobRef.update({
        status: "completed",
        downloadURL,
        fileName: outputFileName
      });
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
    concurrency: { limit: 10 }, // Process up to 10 in parallel for Pro/Business users
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

    // 1. Get all Free users (either tier is "Free" or stats doc not created/default)
    const freeUsers = await step.run("fetch-free-users", async () => {
      const usersSnapshot = await getAdminDb().collection("users").get();
      const freeUserIds: string[] = [];

      for (const userDoc of usersSnapshot.docs) {
        const uid = userDoc.id;
        const statsDoc = await getAdminDb().doc(`users/${uid}/stats/overview`).get();
        const tier = statsDoc.exists ? statsDoc.data()?.subscriptionTier : "Free";

        if (!tier || tier === "Free") {
          freeUserIds.push(uid);
        }
      }

      return freeUserIds;
    });

    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
    const cutoffMs = Date.now() - SEVEN_DAYS_MS;
    const cutoffDate = new Date(cutoffMs);

    // 2. Clean up each free user's data older than 7 days
    for (const uid of freeUsers) {
      await step.run(`cleanup-user-${uid}`, async () => {
        // A. Delete old processed exports (Excel files)
        const exportsSnapshot = await getAdminDb()
          .collection(`users/${uid}/processedExports`)
          .get();

        for (const doc of exportsSnapshot.docs) {
          const data = doc.data();
          const createdAtDate = data.createdAt?.toDate ? data.createdAt.toDate() : (data.createdAt?.seconds ? new Date(data.createdAt.seconds * 1000) : new Date(data.createdAt || 0));
          if (createdAtDate.getTime() <= cutoffMs) {
            if (data.storagePath) {
              try { await bucket.file(data.storagePath).delete(); } catch (e) { }
            }
            await doc.ref.delete();
          }
        }

        // B. Delete old user files (Uploaded PDFs)
        const filesSnapshot = await getAdminDb()
          .collection(`users/${uid}/files`)
          .get();

        for (const doc of filesSnapshot.docs) {
          const data = doc.data();
          const createdAtDate = data.createdAt?.toDate ? data.createdAt.toDate() : (data.createdAt?.seconds ? new Date(data.createdAt.seconds * 1000) : new Date(data.createdAt || 0));
          if (createdAtDate.getTime() <= cutoffMs) {
            if (data.storagePath) {
              try { await bucket.file(data.storagePath).delete(); } catch (e) { }
            }
            await doc.ref.delete();
          }
        }

        // C. Delete old batch jobs (Raw JSON Results)
        const jobsSnapshot = await getAdminDb()
          .collection(`users/${uid}/batchJobs`)
          .get();

        for (const doc of jobsSnapshot.docs) {
          const data = doc.data();
          const createdAtDate = data.createdAt?.toDate ? data.createdAt.toDate() : (data.createdAt?.seconds ? new Date(data.createdAt.seconds * 1000) : new Date(data.createdAt || 0));
          if (createdAtDate.getTime() <= cutoffMs) {
            await doc.ref.delete();
          }
        }
      });
    }

    return { success: true, processedUsers: freeUsers.length };
  }
);

// --- Credit allocation per tier ---
const PLAN_CREDIT_MAP: Record<string, number> = {
  Free: 10,
  Starter: 150,
  Business: 1000,
  Enterprise: 5000,
};

// --- Razorpay Webhook Handler ---
export const handleRazorpayEvent = inngest.createFunction(
  {
    id: "handle-razorpay-event",
    retries: 5,
    triggers: { event: "finflow/razorpay.webhook" as any },
  },
  async ({ event, step }) => {
    const { eventType, payload } = event.data;

    // --- PAYMENT CAPTURED (Top-Up Credits) ---
    if (eventType === "payment.captured") {
      await step.run("fulfill-topup-credits", async () => {
        const payment = payload.payment?.entity;
        if (!payment) return;

        const notes = payment.notes || {};
        if (notes.type !== "topup") return; // Only handle top-up payments

        const userId = notes.userId;
        const credits = parseInt(notes.credits, 10);
        if (!userId || !credits) return;

        const statsRef = getAdminDb()
          .collection("users")
          .doc(userId)
          .collection("stats")
          .doc("overview");

        await statsRef.update({
          topUpCreditsRemaining: FieldValue.increment(credits),
        });

        // Log the transaction
        await getAdminDb()
          .collection("users")
          .doc(userId)
          .collection("transactions")
          .add({
            type: "topup",
            credits,
            amount: payment.amount / 100, // paise → rupees
            currency: payment.currency,
            razorpayPaymentId: payment.id,
            razorpayOrderId: payment.order_id,
            createdAt: FieldValue.serverTimestamp(),
          });

        console.log(`[Razorpay] Fulfilled ${credits} top-up credits for user ${userId}`);
      });
    }

    // --- SUBSCRIPTION ACTIVATED (New subscription starts) ---
    if (eventType === "subscription.activated") {
      await step.run("activate-subscription", async () => {
        const subscription = payload.subscription?.entity;
        if (!subscription) return;

        const notes = subscription.notes || {};
        const userId = notes.userId;
        const tierName = notes.tierName || "Starter";
        if (!userId) return;

        const monthlyCredits = PLAN_CREDIT_MAP[tierName] || 150;

        const statsRef = getAdminDb()
          .collection("users")
          .doc(userId)
          .collection("stats")
          .doc("overview");

        await statsRef.update({
          subscriptionTier: tierName,
          subscriptionId: subscription.id,
          subscriptionStatus: "active",
          monthlyCreditsRemaining: monthlyCredits,
          rolloverCreditsRemaining: 0,
        });

        // Log
        await getAdminDb()
          .collection("users")
          .doc(userId)
          .collection("transactions")
          .add({
            type: "subscription_activated",
            tier: tierName,
            razorpaySubscriptionId: subscription.id,
            createdAt: FieldValue.serverTimestamp(),
          });

        console.log(`[Razorpay] Activated ${tierName} for user ${userId}`);
      });
    }

    // --- SUBSCRIPTION CHARGED (Monthly/yearly renewal) ---
    if (eventType === "subscription.charged") {
      await step.run("renew-credits-with-rollover", async () => {
        const subscription = payload.subscription?.entity;
        if (!subscription) return;

        const notes = subscription.notes || {};
        const userId = notes.userId;
        const tierName = notes.tierName || "Starter";
        if (!userId) return;

        const monthlyCredits = PLAN_CREDIT_MAP[tierName] || 150;

        const statsRef = getAdminDb()
          .collection("users")
          .doc(userId)
          .collection("stats")
          .doc("overview");

        const statsDoc = await statsRef.get();
        const currentStats = statsDoc.data() || {};

        // 10% rollover calculation, capped at 1× monthly allowance
        const currentMonthly = currentStats.monthlyCreditsRemaining || 0;
        const currentRollover = currentStats.rolloverCreditsRemaining || 0;
        const newRollover = Math.min(
          currentRollover + Math.floor(currentMonthly * 0.10),
          monthlyCredits // Cap at 1× monthly allowance
        );

        await statsRef.update({
          monthlyCreditsRemaining: monthlyCredits,
          rolloverCreditsRemaining: newRollover,
          subscriptionStatus: "active",
        });

        console.log(
          `[Razorpay] Renewed ${tierName} for ${userId}: ${monthlyCredits} monthly + ${newRollover} rollover`
        );
      });
    }

    // --- SUBSCRIPTION HALTED or CANCELLED ---
    if (eventType === "subscription.halted" || eventType === "subscription.cancelled") {
      await step.run("downgrade-to-free", async () => {
        const subscription = payload.subscription?.entity;
        if (!subscription) return;

        const notes = subscription.notes || {};
        const userId = notes.userId;
        if (!userId) return;

        const statsRef = getAdminDb()
          .collection("users")
          .doc(userId)
          .collection("stats")
          .doc("overview");

        await statsRef.update({
          subscriptionTier: "Free",
          subscriptionId: "",
          subscriptionStatus: eventType === "subscription.cancelled" ? "cancelled" : "halted",
          monthlyCreditsRemaining: PLAN_CREDIT_MAP.Free,
          rolloverCreditsRemaining: 0,
          // Top-up credits are preserved — they paid real money for those
        });

        console.log(`[Razorpay] Downgraded user ${userId} to Free (${eventType})`);
      });
    }

    return { processed: eventType };
  }
);
