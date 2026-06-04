import { NextResponse } from "next/server";
import { inngest } from "@/inngest/client";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

// POST /api/batch/start
// Called by the frontend to kick off background processing.
// Creates a Firestore batchJob document and sends Inngest events for each file.

interface StartBatchRequest {
  files: Array<{ name: string; url: string }>;
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

    // 1. Fetch user tier to route to correct queue (Velocity Paywall)
    const statsDoc = await getAdminDb()
      .collection("users")
      .doc(userId)
      .collection("stats")
      .doc("default")
      .get();
      
    const tier = statsDoc.data()?.subscriptionTier || "Free";
    const eventName = tier === "Free" 
      ? "finflow/file.process.free" 
      : "finflow/file.process.pro";

    // 2. Create a batchJob document in Firestore for progress tracking
    const batchJobRef = getAdminDb()
      .collection("users")
      .doc(userId)
      .collection("batchJobs")
      .doc(); // Auto-generate ID

    const batchJobId = batchJobRef.id;

    await batchJobRef.set({
      templateName,
      templateFields,
      totalFiles: files.length,
      completedFiles: 0,
      status: "processing",
      results: [],
      createdAt: FieldValue.serverTimestamp(),
    });

    // 3. Create one Inngest event per file
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

    // 4. Send all events to the queue instantly (<1 second for 450+ files)
    await inngest.send(events);

    console.log(
      `[BatchStart] Queued ${files.length} files for batch "${batchJobId}"`
    );

    return NextResponse.json({
      batchJobId,
      totalFiles: files.length,
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
