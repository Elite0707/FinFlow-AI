import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { processFileFree, processFilePro, cleanupFreeTierData, handleRazorpayEvent } from "@/inngest/functions";

// This endpoint lets Inngest communicate with your background functions.
// Inngest Dev Server (localhost:8288) discovers functions via GET,
// and triggers them via POST.
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [processFileFree, processFilePro, cleanupFreeTierData, handleRazorpayEvent],
});
