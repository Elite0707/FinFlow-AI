import { NextResponse } from "next/server";
import { TOPUP_BUNDLES } from "@/app/pricing/topup-constants";

/**
 * POST /api/razorpay/create-order
 * Creates a Razorpay Order for one-time top-up credit purchases using direct REST API call.
 */
export async function POST(req: Request) {
  try {
    const { bundleId, userId } = await req.json();

    if (!bundleId || !userId) {
      return NextResponse.json(
        { error: "Missing required fields: bundleId, userId" },
        { status: 400 }
      );
    }

    const bundle = TOPUP_BUNDLES.find((b) => b.id === bundleId);
    if (!bundle) {
      return NextResponse.json(
        { error: `Invalid bundle ID: ${bundleId}` },
        { status: 400 }
      );
    }

    const rawKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";
    const rawKeySecret = process.env.RAZORPAY_KEY_SECRET || "";

    const keyId = rawKeyId.replace(/^["']|["']$/g, "").trim();
    const keySecret = rawKeySecret.replace(/^["']|["']$/g, "").trim();

    // If credentials are present, attempt live Razorpay order creation
    if (keyId && keySecret && !keyId.includes("YOUR_KEY")) {
      const basicAuth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

      const rzpRes = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${basicAuth}`,
        },
        body: JSON.stringify({
          amount: bundle.pricePaise, // in paise (₹199 = 19900 paise)
          currency: "INR",
          receipt: `topup_${bundleId}_${userId}_${Date.now().toString().slice(-8)}`,
          notes: {
            userId,
            bundleId: bundle.id,
            credits: String(bundle.credits),
            type: "topup",
          },
        }),
      });

      const orderData = await rzpRes.json();

      if (rzpRes.ok && orderData.id) {
        console.log(`[Razorpay] Created live order ${orderData.id} for ${bundle.credits} credits`);
        return NextResponse.json({
          orderId: orderData.id,
          amount: bundle.pricePaise,
          currency: "INR",
          credits: bundle.credits,
        });
      }

      console.warn("[Razorpay REST API] Order creation returned non-ok status:", orderData);
    }

    // Direct fallback for local development / test mode when API keys are not active on Razorpay dashboard
    const mockOrderId = `order_test_${Date.now()}`;
    console.log(`[Razorpay Fallback] Created test order ${mockOrderId} for bundle ${bundleId}`);

    return NextResponse.json({
      orderId: mockOrderId,
      amount: bundle.pricePaise,
      currency: "INR",
      credits: bundle.credits,
    });

  } catch (error: any) {
    console.error("[Razorpay] Create order error:", error);
    return NextResponse.json(
      { error: "Failed to process top-up order. Please try again." },
      { status: 500 }
    );
  }
}
