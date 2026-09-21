import { inngest } from "./client";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getAdminDb, getAdminStorage } from "@/lib/firebaseAdmin";
import { recordComputeAuditLog } from "@/lib/auditLog";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import ExcelJS from "exceljs";
import crypto from "crypto";
import { PDFDocument } from "pdf-lib";

// --- MIME type helper ---
const MIME_MAP: Record<string, string> = {
  pdf: "application/pdf",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

const SUPPORTED_EXTENSIONS = Object.keys(MIME_MAP);

function getMimeType(fileName: string): string | null {
  const ext = fileName.split(".").pop()?.toLowerCase() || "";
  return MIME_MAP[ext] || null;
}

// --- PDF page extraction helper ---
/**
 * Extracts up to `maxPages` pages from a PDF buffer.
 * Free tier: 1 page. Pro/Business: 5 pages.
 */
async function extractPages(arrayBuffer: ArrayBuffer, maxPages: number): Promise<ArrayBuffer> {
  const srcDoc = await PDFDocument.load(arrayBuffer);
  const totalPages = srcDoc.getPageCount();
  if (totalPages <= maxPages) return arrayBuffer;

  const newDoc = await PDFDocument.create();
  const pageIndices = Array.from({ length: Math.min(maxPages, totalPages) }, (_, i) => i);
  const pages = await newDoc.copyPages(srcDoc, pageIndices);
  pages.forEach(page => newDoc.addPage(page));

  const pdfBytes = await newDoc.save();
  return pdfBytes.buffer as ArrayBuffer;
}

// --- Shared Extraction Logic ---
async function performExtraction(
  step: any,
  fileName: string,
  fileUrl: string,
  templateFields: string[],
  batchJobId: string,
  userId: string,
  creditsForFile: number = 1,
  maxPages: number = 1
) {
  // STEP 1: Durable Save Point — Extract data from Gemini
  // Errors are caught gracefully so the function always proceeds to the save step
  const extractionResult = await step.run("extract-from-gemini", async () => {
    try {
      // Check if batch job was cancelled by user
      const batchDoc = await getAdminDb()
        .collection("users")
        .doc(userId)
        .collection("batchJobs")
        .doc(batchJobId)
        .get();

      if (batchDoc.exists && batchDoc.data()?.status === "cancelled") {
        throw new Error("BATCH_CANCELLED: Batch processing was cancelled by user.");
      }

      const response = await fetch(fileUrl);
      if (!response.ok) {
        throw new Error(`Failed to download "${fileName}": ${response.status} ${response.statusText}`);
      }
      let arrayBuffer = await response.arrayBuffer();
      const mimeType = getMimeType(fileName);

      // Reject unsupported file formats with a clear error
      if (!mimeType) {
        const ext = fileName.split(".").pop()?.toLowerCase() || "unknown";
        throw new Error(
          `UNSUPPORTED_FORMAT: File format ".${ext}" is not supported. Supported formats: ${SUPPORTED_EXTENSIONS.map(e => `.${e}`).join(", ")}.`
        );
      }

      // Limit PDF pages based on tier: Free=1 page, Pro/Business=5 pages
      if (maxPages > 0 && mimeType === "application/pdf") {
        try {
          arrayBuffer = await extractPages(arrayBuffer, maxPages);
          console.log(`[Extraction] PDF "${fileName}" limited to ${maxPages} page(s).`);
        } catch (pdfErr) {
          console.warn(`[Extraction] Could not limit PDF "${fileName}" pages, sending full document:`, pdfErr);
        }
      }

      const base64Data = Buffer.from(arrayBuffer).toString("base64");

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
        - __party_name: The name of the BUYER / RECEIVER / CUSTOMER company. This is the company found under "RECEIVER (Bill to Party)", "Bill To", "To", "M/S", "Buyer", "Ship To", or "Consignee" sections — NOT the seller/issuer at the top of the document. This is a MANDATORY system field for internal grouping.

        ### EXTRACTION RULES
        1. **Context Awareness**: Identify the 'Vendor/Seller' (who issued the bill) vs 'Buyer/Receiver' (who the bill is addressed to).
           - Vendor/Seller Name = the company at the TOP of the invoice (the seller/issuer). DO NOT use this for __party_name.
           - Buyer/Receiver Name = the company found under 'RECEIVER (Bill to Party)', 'Bill To', 'To', 'M/S', 'Buyer', 'Consignee', or 'Ship To'. USE THIS for __party_name.
        2. **GSTIN Rule**: When "GSTIN" is requested, extract the **CUSTOMER's (buyer's) GSTIN**, 
           NOT the vendor's GSTIN. The customer GSTIN is typically found near the "Bill To" / 
           "Ship To" section. The vendor GSTIN at the top of the invoice belongs to the seller — ignore it for this field.
        3. **No Hallucinations**: If a field is not explicitly printed on the document, return "". Do not guess.
        4. **Format**: Clean all currency symbols (e.g., "$", "₹") and return only the numeric value for totals.
        5. **Dates**: Standardize all dates to YYYY-MM-DD.
        6. **__party_name**: MANDATORY. Must be the BUYER/RECEIVER company name, never the seller. Never return "" for this field.
        7. **Multiple Invoices**: If this document contains MULTIPLE invoices (e.g., one invoice per page), extract each invoice separately and return a JSON ARRAY of objects, one per invoice. Each object must have all the fields listed above including __party_name.

        ### OUTPUT
        - If the document contains a SINGLE invoice, return a strict JSON object.
        - If the document contains MULTIPLE invoices, return a JSON ARRAY of objects.
        - No markdown formatting, no conversational filler.
    `
        : `
        ### ROLE
        You are a Precision Financial Auditor. Auto-detect all critical financial metadata.

        ### INSTRUCTIONS
        - Extract: Invoice Number, Date, Vendor Name, Customer Name, GSTIN/Tax ID, Taxable Value, Tax Amount, and Grand Total.
        - Also extract: __party_name (the BUYER/RECEIVER company name from "Bill To" / "Receiver" section — MANDATORY. NOT the seller name at the top).
        - If this document contains MULTIPLE invoices, return a JSON ARRAY of objects, one per invoice.
        - If only one invoice, return a single JSON object.
        - Detect any additional line items if present.
        - Use "snake_case" for auto-detected keys.
    `;

      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: base64Data,
            mimeType: mimeType,
          },
        },
      ]);

      const text = result.response.text().trim();
      const cleaned = text.replace(/^```json\s*/i, "").replace(/^```\s*/, "").replace(/\s*```$/, "").trim();

      const parsed = JSON.parse(cleaned);

      // Normalize result: single object or array of objects -> array
      const normalizedArray = Array.isArray(parsed) ? parsed : [parsed];

      return { success: true as const, fields: normalizedArray, error: null };
    } catch (err: any) {
      const rawMessage = err?.message || String(err);
      let userFriendlyError = `Extraction failed for "${fileName}". Please retry.`;

      if (rawMessage.includes("BATCH_CANCELLED")) {
        userFriendlyError = "Cancelled by user";
      } else if (rawMessage.includes("Failed to download")) {
        userFriendlyError = `Could not download file "${fileName}". The file may have been deleted or the link expired.`;
      } else if (rawMessage.includes("SAFETY") || rawMessage.includes("blocked")) {
        userFriendlyError = `Content in "${fileName}" was blocked by safety filters. Try a different document.`;
      } else if (rawMessage.includes("429") || rawMessage.includes("quota") || rawMessage.includes("rate")) {
        userFriendlyError = `API rate limit reached. "${fileName}" will be retried automatically.`;
      } else if (rawMessage.includes("JSON") || rawMessage.includes("parse") || rawMessage.includes("Unexpected token")) {
        userFriendlyError = `AI returned invalid data for "${fileName}". The document format may not be supported.`;
      } else if (rawMessage.includes("GEMINI_API_KEY")) {
        userFriendlyError = "Server configuration error: API key not set. Contact support.";
      } else if (rawMessage.includes("too large") || rawMessage.includes("payload") || rawMessage.includes("413")) {
        userFriendlyError = `File "${fileName}" is too large to process. Try a smaller file or fewer pages.`;
      } else if (rawMessage.includes("UNSUPPORTED_FORMAT")) {
        userFriendlyError = rawMessage.replace("UNSUPPORTED_FORMAT: ", "");
      } else if (rawMessage.includes("Could not read PDF") || rawMessage.includes("password") || rawMessage.includes("encrypted")) {
        userFriendlyError = `"${fileName}" appears to be corrupted or password-protected.`;
      }

      console.error(`[Extraction] Failed for "${fileName}":`, rawMessage);
      return { success: false as const, fields: {}, error: userFriendlyError };
    }
  });

  // STEP 2: Durable Save Point — Save results to Firestore (handles both success and failure)
  await step.run("save-results-to-firestore", async () => {
    const batchJobRef = getAdminDb()
      .collection("users")
      .doc(userId)
      .collection("batchJobs")
      .doc(batchJobId);

    if (extractionResult.success) {
      // ✅ Success — record each extracted invoice as a separate result row
      // Multi-invoice PDFs produce multiple entries; single-invoice PDFs produce one
      const fieldsArray = extractionResult.fields as Record<string, any>[];
      const resultEntries = fieldsArray.map((fields: Record<string, any>) => ({
        fileName,
        status: "Success",
        fields,
      }));

      await batchJobRef.update({
        completedFiles: FieldValue.increment(1),
        results: FieldValue.arrayUnion(...resultEntries),
      });

      // Record immutable compute audit log for Layer 2 Chargeback Defense
      await recordComputeAuditLog({
        userId,
        batchJobId,
        fileName,
        pagesProcessed: maxPages || 1,
        creditsDeducted: creditsForFile || 1,
        status: "COMPLETED",
      });
    } else {
      const isCancelled = extractionResult.error === "Cancelled by user";

      // ❌ Failure / Cancelled — record the error and refund credits
      await batchJobRef.update({
        completedFiles: FieldValue.increment(1),
        ...(isCancelled ? { cancelledFiles: FieldValue.increment(1) } : { failedFiles: FieldValue.increment(1) }),
        results: FieldValue.arrayUnion({
          fileName,
          status: isCancelled ? "Cancelled" : "Failed",
          error: extractionResult.error,
          fields: {},
        }),
      });

      // Refund credits for failed files (cancellations are refunded in bulk by UI cancelBatchJob)
      if (!isCancelled) {
        const statsRef = getAdminDb()
          .collection("users")
          .doc(userId)
          .collection("stats")
          .doc("overview");

        await statsRef.update({
          monthlyCreditsRemaining: FieldValue.increment(creditsForFile),
          totalDocumentsProcessed: FieldValue.increment(-1),
        });

        console.log(
          `[Extraction] Refunded ${creditsForFile} credit(s) for failed file "${fileName}" (user: ${userId})`
        );
      }
    }

    // Check if batch is complete
    const updatedDoc = await batchJobRef.get();
    const data = updatedDoc.data();
    if (data && data.completedFiles >= data.totalFiles) {
      const results = data.results || [];
      const successResults = results.filter((r: any) => r.status === "Success");
      const failedResults = results.filter((r: any) => r.status === "Failed");

      // If ALL files failed, mark batch as failed with aggregated error info
      if (successResults.length === 0) {
        const errorSamples = failedResults
          .slice(0, 3)
          .map((r: any) => `"${r.fileName}": ${r.error || "Unknown error"}`)
          .join("; ");

        await batchJobRef.update({
          status: "failed",
          failureReason: `All ${failedResults.length} file(s) failed to extract. ${errorSamples}`,
        });
        return;
      }

      // At least some files succeeded — generate Excel with successful results
      const workbook = new ExcelJS.Workbook();
      const templateFields = data.templateFields || [];
      const templateName = data.templateName || "Template";

      // Filter out __party_name from display columns (it's a system field for grouping only)
      const displayFields = templateFields.filter((f: string) => f !== "__party_name");

      // Group the data by party name:
      // Priority 1: __party_name (always extracted by our enhanced prompt)
      // Priority 2: Template field matching vendor/company/party/name regex
      // Priority 3: Filename fallback (last resort)
      const groupKey = templateFields.find((f: string) =>
        /vendor|company|party|name|customer|client|buyer/i.test(f)
      );

      const groupedData: Record<string, any[]> = {};
      successResults.forEach((row: any) => {
        const fields = row.fields || {};
        let companyName = "";

        // Priority 1: Use __party_name (system field)
        if (fields["__party_name"] && fields["__party_name"] !== "" && fields["__party_name"] !== "Not Found") {
          companyName = fields["__party_name"];
        }

        // Priority 2: Fall back to regex-matched template field
        if (!companyName && groupKey) {
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

        // Priority 3: Filename fallback (last resort)
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
        const colWidths = displayFields.map((f: string) => ({
          width: Math.max(15, Math.min(40, f.length * 1.5 + 5))
        }));
        sheet.columns = colWidths;

        sheet.addRow([`NAME  :---`, company, ...Array(Math.max(0, displayFields.length - 2)).fill("")]);
        sheet.addRow(Array(displayFields.length).fill(""));

        const headerRow = sheet.addRow(displayFields);
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
          const rowValues = displayFields.map((field: string) => {
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

      // Upload to Firebase Storage using Admin SDK
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

      // Save reference to processedExports Firestore collection
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

      // Update batchJob — mark completed with partial failure info if applicable
      const updateData: Record<string, any> = {
        status: "completed",
        downloadURL,
        fileName: outputFileName,
      };

      if (failedResults.length > 0) {
        updateData.partialFailure = true;
        updateData.failedFileNames = failedResults.map((r: any) => r.fileName);
        updateData.failureCount = failedResults.length;
        updateData.failureReason = failedResults
          .slice(0, 3)
          .map((r: any) => `"${r.fileName}": ${r.error || "Unknown error"}`)
          .join("; ");
      }

      await batchJobRef.update(updateData);
    }
  });

  return extractionResult.success ? extractionResult.fields : {};
}

// --- Fix 2: Shared onFailure Safety Net ---
// Runs when ALL retries are exhausted and the function crashes
// before our internal error handling can catch it (e.g., OOM, infrastructure failure)
async function handleWorkerFailure({ event, error }: { event: any; error: any }) {
  // In Inngest v4, the onFailure event wraps the original event
  const originalData = event?.data?.event?.data || event?.data || {};
  const { fileName, batchJobId, userId, creditsForFile } = originalData;

  const errorMessage = error instanceof Error
    ? error.message
    : (error?.message || String(error));

  console.error(
    `[onFailure] All retries exhausted for "${fileName || "unknown"}" in batch "${batchJobId}":`,
    errorMessage
  );

  if (!batchJobId || !userId) {
    console.error("[onFailure] Missing batchJobId or userId — cannot record failure.");
    return;
  }

  try {
    const batchJobRef = getAdminDb()
      .collection("users")
      .doc(userId)
      .collection("batchJobs")
      .doc(batchJobId);

    // Record the catastrophic failure in batch results
    await batchJobRef.update({
      completedFiles: FieldValue.increment(1),
      failedFiles: FieldValue.increment(1),
      results: FieldValue.arrayUnion({
        fileName: fileName || "Unknown file",
        status: "Failed",
        error: `Extraction crashed after all retries: ${errorMessage}`,
        fields: {},
      }),
    });

    // Refund credits for this file
    const credits = creditsForFile || 1;
    const statsRef = getAdminDb()
      .collection("users")
      .doc(userId)
      .collection("stats")
      .doc("overview");

    await statsRef.update({
      monthlyCreditsRemaining: FieldValue.increment(credits),
      totalDocumentsProcessed: FieldValue.increment(-1),
    });

    console.log(`[onFailure] Refunded ${credits} credit(s) for crashed file "${fileName}"`);

    // Check if batch is now complete and update status
    const updatedDoc = await batchJobRef.get();
    const data = updatedDoc.data();
    if (data && data.completedFiles >= data.totalFiles) {
      const results = data.results || [];
      const hasSuccess = results.some((r: any) => r.status === "Success");

      if (!hasSuccess) {
        await batchJobRef.update({
          status: "failed",
          failureReason: `All files failed. Last error: ${errorMessage}`,
        });
      }
      // If some succeeded but the batch is still "processing", the last successful
      // worker's save-step will handle marking it "completed" with Excel generation.
    }
  } catch (firestoreErr) {
    console.error(`[onFailure] Failed to record failure for "${fileName}":`, firestoreErr);
  }
}

// --- The Workers ---

// Free Tier Worker: Slow (Concurrency 1, 5s artificial sleep)
export const processFileFree = inngest.createFunction(
  {
    id: "finflow-process-file-free",
    concurrency: { limit: 1 }, // Strictly one by one
    retries: 3,
    onFailure: handleWorkerFailure,
    triggers: { event: "finflow/file.process.free" },
  },
  async ({ event, step }) => {
    const { fileName, fileUrl, templateFields, batchJobId, userId, creditsForFile } = event.data;

    // Artificial velocity throttle for free users
    await step.sleep("velocity-throttle", "5s");

    const extractedFields = await performExtraction(
      step, fileName, fileUrl, templateFields, batchJobId, userId, creditsForFile || 1, 1
    );
    return { success: true, fileName, fields: extractedFields, tier: "free" };
  }
);

// Pro Tier Worker: Lightning Fast (Concurrency 10)
export const processFilePro = inngest.createFunction(
  {
    id: "finflow-process-file-pro",
    concurrency: { limit: 10 }, // Process up to 10 in parallel for Pro/Business users
    retries: 3,
    onFailure: handleWorkerFailure,
    triggers: { event: "finflow/file.process.pro" },
  },
  async ({ event, step }) => {
    const { fileName, fileUrl, templateFields, batchJobId, userId, creditsForFile } = event.data;

    const extractedFields = await performExtraction(
      step, fileName, fileUrl, templateFields, batchJobId, userId, creditsForFile || 1, 5
    );

    // Cooldown to avoid Gemini 429 limits even for Pro
    await step.sleep("gemini-cooldown", "2s");

    return { success: true, fileName, fields: extractedFields, tier: "pro" };
  }
);

// --- Tier-Based Data Retention Cron Job ---
// Uploaded files & batch jobs retention: Free=7d, Starter=90d, Business=3y
// Generated ledgers (processedExports): Free=7d, Starter/Business/Enterprise=permanent
const FILE_RETENTION_MS: Record<string, number> = {
  Free: 7 * 24 * 60 * 60 * 1000,           // 7 days
  Starter: 90 * 24 * 60 * 60 * 1000,        // 90 days (1 quarter)
  Business: 3 * 365 * 24 * 60 * 60 * 1000,  // 3 years
  Enterprise: 0,                              // 0 = permanent (never delete)
};

const LEDGER_RETENTION_MS: Record<string, number> = {
  Free: 7 * 24 * 60 * 60 * 1000,            // 7 days
  Starter: 0,                                 // 0 = permanent
  Business: 0,                                // 0 = permanent
  Enterprise: 0,                              // 0 = permanent
};

export const cleanupUserData = inngest.createFunction(
  {
    id: "cleanup-user-data",
    triggers: [{ cron: "0 0 * * *" }], // Run at midnight every day
  },
  async ({ step }) => {
    const bucket = getAdminStorage().bucket();

    // 1. Fetch all users and their subscription tiers
    const usersWithTiers = await step.run("fetch-users-with-tiers", async () => {
      const usersSnapshot = await getAdminDb().collection("users").get();
      const result: { uid: string; tier: string }[] = [];

      for (const userDoc of usersSnapshot.docs) {
        const uid = userDoc.id;
        const statsDoc = await getAdminDb().doc(`users/${uid}/stats/overview`).get();
        const tier = statsDoc.exists ? (statsDoc.data()?.subscriptionTier || "Free") : "Free";
        result.push({ uid, tier });
      }

      return result;
    });

    const now = Date.now();

    // Helper: resolve timestamp from Firestore doc
    const getTimestamp = (data: any): number => {
      const createdAt = data.createdAt;
      if (!createdAt) return 0;
      if (createdAt.toDate) return createdAt.toDate().getTime();
      if (createdAt.seconds) return createdAt.seconds * 1000;
      return new Date(createdAt).getTime() || 0;
    };

    // 2. Clean up each user's data based on their tier
    for (const { uid, tier } of usersWithTiers) {
      const fileRetention = FILE_RETENTION_MS[tier] ?? FILE_RETENTION_MS.Free;
      const ledgerRetention = LEDGER_RETENTION_MS[tier] ?? LEDGER_RETENTION_MS.Free;

      // Skip users with fully permanent retention (Enterprise)
      if (fileRetention === 0 && ledgerRetention === 0) continue;

      await step.run(`cleanup-user-${uid}`, async () => {
        // A. Delete old generated ledgers (processedExports)
        // Free: 7 days, Starter/Business/Enterprise: permanent (skip)
        if (ledgerRetention > 0) {
          const ledgerCutoff = now - ledgerRetention;
          const exportsSnapshot = await getAdminDb()
            .collection(`users/${uid}/processedExports`)
            .get();

          for (const doc of exportsSnapshot.docs) {
            const data = doc.data();
            if (getTimestamp(data) <= ledgerCutoff) {
              if (data.storagePath) {
                try { await bucket.file(data.storagePath).delete(); } catch (e) { }
              }
              await doc.ref.delete();
            }
          }
        }

        // B. Delete old uploaded files (PDFs)
        // Free: 7d, Starter: 90d, Business: 3y, Enterprise: permanent (skip)
        if (fileRetention > 0) {
          const fileCutoff = now - fileRetention;
          const filesSnapshot = await getAdminDb()
            .collection(`users/${uid}/files`)
            .get();

          for (const doc of filesSnapshot.docs) {
            const data = doc.data();
            if (getTimestamp(data) <= fileCutoff) {
              if (data.storagePath) {
                try { await bucket.file(data.storagePath).delete(); } catch (e) { }
              }
              await doc.ref.delete();
            }
          }

          // C. Delete old batch jobs (Raw JSON Results) — same retention as files
          const jobsSnapshot = await getAdminDb()
            .collection(`users/${uid}/batchJobs`)
            .get();

          for (const doc of jobsSnapshot.docs) {
            const data = doc.data();
            if (getTimestamp(data) <= fileCutoff) {
              await doc.ref.delete();
            }
          }
        }
      });
    }

    return { success: true, processedUsers: usersWithTiers.length };
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
