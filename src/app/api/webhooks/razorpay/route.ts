import { NextResponse } from "next/server";
import crypto from "crypto";
import { inngest } from "@/inngest/client";

/**
 * POST /api/webhooks/razorpay
 * Receives server-to-server webhook events from Razorpay.
 * Verifies the signature, returns 200 immediately, and forwards
 * the payload to an Inngest background worker for safe processing.
 */
export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature") || "";

    // Verify webhook signature
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (webhookSecret) {
      const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(rawBody)
        .digest("hex");

      if (expectedSignature !== signature) {
        console.error("[Webhook] Invalid Razorpay signature");
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    } else {
      console.warn("[Webhook] RAZORPAY_WEBHOOK_SECRET not set — skipping signature verification");
    }

    const payload = JSON.parse(rawBody);
    const eventType = payload.event;

    console.log(`[Webhook] Received Razorpay event: ${eventType}`);

    // Supported events
    const supportedEvents = [
      "payment.captured",
      "subscription.activated",
      "subscription.charged",
      "subscription.halted",
      "subscription.cancelled",
    ];

    if (supportedEvents.includes(eventType)) {
      // Forward to Inngest for durable background processing with retries
      await inngest.send({
        name: "finflow/razorpay.webhook" as any,
        data: {
          eventType,
          payload: payload.payload,
        },
      });

      console.log(`[Webhook] Forwarded ${eventType} to Inngest background worker`);
    } else {
      console.log(`[Webhook] Ignoring unsupported event: ${eventType}`);
    }

    // Always return 200 immediately to Razorpay
    return NextResponse.json({ status: "ok" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[Webhook] Error:", message);
    // Return 200 even on error to prevent Razorpay from retrying
    return NextResponse.json({ status: "ok" });
  }
}
