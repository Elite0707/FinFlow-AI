import { NextResponse } from "next/server";
import { inngest } from "@/inngest/client";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

// POST /api/batch/start
// Called by the frontend to kick off background processing.
// Includes pre-flight credit check before queueing.

interface StartBatchRequest {
  files: Array<{ name: string; url: string; pages?: number }>;
  templateName: string;
  templateFields: string[];
  userId: string;
}

export async function POST(req: Request) {
  try {
    const body: StartBatchRequest = await req.json();
    const { files, templateName, templateFields, userId } = body;

    if (!files?.length || !userId || !templateFields?.length) {
      return NextResponse.json(
        { error: "Missing required fields: files, userId, templateFields" },
        { status: 400 }
      );
    }

    // 1. Fetch user stats (tier + credits)
    const statsRef = getAdminDb()
      .collection("users")
      .doc(userId)
      .collection("stats")
      .doc("default");

    const statsDoc = await statsRef.get();
    const stats = statsDoc.data() || {};

    const tier = stats.subscriptionTier || "Free";
    const eventName = tier === "Free"
      ? "finflow/file.process.free"
      : "finflow/file.process.pro";

    // 2. Calculate credits required (client sends page counts)
    // 1 credit = up to 5 pages. Free tier: 1 page per document max.
    const creditsRequired = files.reduce((sum, file) => {
      const pages = file.pages || 1; // Default to 1 if not provided
      return sum + Math.ceil(pages / 5);
    }, 0);

    // 3. Check available credits across all buckets
    const monthlyCredits = stats.monthlyCreditsRemaining || 0;
    const rolloverCredits = stats.rolloverCreditsRemaining || 0;
    const topUpCredits = stats.topUpCreditsRemaining || 0;
    const totalAvailable = monthlyCredits + rolloverCredits + topUpCredits;

    if (creditsRequired > totalAvailable) {
      return NextResponse.json(
        {
          error: "Insufficient credits",
          creditsRequired,
          creditsAvailable: totalAvailable,
          breakdown: {
            monthly: monthlyCredits,
            rollover: rolloverCredits,
            topUp: topUpCredits,
          },
        },
        { status: 402 }
      );
    }

    // 4. Deduct credits in priority order: Monthly → Rollover → TopUp
    let remaining = creditsRequired;
    let deductMonthly = 0;
    let deductRollover = 0;
    let deductTopUp = 0;

    // Deduct from monthly first
    deductMonthly = Math.min(remaining, monthlyCredits);
    remaining -= deductMonthly;

    // Then from rollover
    if (remaining > 0) {
      deductRollover = Math.min(remaining, rolloverCredits);
      remaining -= deductRollover;
    }

    // Then from top-up
    if (remaining > 0) {
      deductTopUp = Math.min(remaining, topUpCredits);
      remaining -= deductTopUp;
    }

    // Atomic credit deduction
    const updatePayload: Record<string, any> = {};
    if (deductMonthly > 0) updatePayload.monthlyCreditsRemaining = FieldValue.increment(-deductMonthly);
    if (deductRollover > 0) updatePayload.rolloverCreditsRemaining = FieldValue.increment(-deductRollover);
    if (deductTopUp > 0) updatePayload.topUpCreditsRemaining = FieldValue.increment(-deductTopUp);
    updatePayload.totalDocumentsProcessed = FieldValue.increment(files.length);

    // Calculate total pages for telemetry
    const totalPages = files.reduce((sum, f) => sum + (f.pages || 1), 0);
    updatePayload.totalPagesProcessed = FieldValue.increment(totalPages);

    await statsRef.update(updatePayload);

    console.log(
      `[BatchStart] Deducted ${creditsRequired} credits (M:${deductMonthly} R:${deductRollover} T:${deductTopUp}) for user ${userId}`
    );

    // 5. Create a batchJob document in Firestore for progress tracking
    const batchJobRef = getAdminDb()
      .collection("users")
      .doc(userId)
      .collection("batchJobs")
      .doc();

    const batchJobId = batchJobRef.id;

    await batchJobRef.set({
      templateName,
      templateFields,
      totalFiles: files.length,
      completedFiles: 0,
      creditsUsed: creditsRequired,
      status: "processing",
      results: [],
      createdAt: FieldValue.serverTimestamp(),
    });

    // 6. Create one Inngest event per file
    const events = files.map((file) => ({
      name: eventName as any,
      data: {
        fileName: file.name,
        fileUrl: file.url,
        templateFields,
        batchJobId,
        userId,
      },
    }));

    // 7. Send all events to the queue instantly
    await inngest.send(events);

    console.log(
      `[BatchStart] Queued ${files.length} files for batch "${batchJobId}" (${creditsRequired} credits)`
    );

    return NextResponse.json({
      batchJobId,
      totalFiles: files.length,
      creditsUsed: creditsRequired,
      message: `${files.length} files queued for processing`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[BatchStart] Error:", message);
    return NextResponse.json(
      { error: `Failed to start batch: ${message}` },
      { status: 500 }
    );
  }
}
