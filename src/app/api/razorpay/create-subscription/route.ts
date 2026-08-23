import { NextResponse } from "next/server";
import { getRazorpay, RAZORPAY_PLAN_IDS } from "@/lib/razorpay";

/**
 * POST /api/razorpay/create-subscription
 * Creates a Razorpay Subscription for recurring billing.
 * The frontend opens the Razorpay modal with the returned subscription_id.
 */
export async function POST(req: Request) {
  try {
    const { planId, billingCycle, userId, userEmail } = await req.json();

    if (!planId || !billingCycle || !userId) {
      return NextResponse.json(
        { error: "Missing required fields: planId, billingCycle, userId" },
        { status: 400 }
      );
    }

    // Validate the plan
    const tierName = planId.charAt(0).toUpperCase() + planId.slice(1); // "starter" → "Starter"
    const planConfig = RAZORPAY_PLAN_IDS[tierName];

    if (!planConfig) {
      return NextResponse.json(
        { error: `Invalid plan: ${planId}` },
        { status: 400 }
      );
    }

    const razorpayPlanId = billingCycle === "yearly"
      ? planConfig.yearly
      : planConfig.monthly;

    if (!razorpayPlanId) {
      return NextResponse.json(
        { error: `No Razorpay plan configured for ${tierName} ${billingCycle}` },
        { status: 500 }
      );
    }

    const razorpay = getRazorpay();

    const subscription = await razorpay.subscriptions.create({
      plan_id: razorpayPlanId,
      total_count: billingCycle === "yearly" ? 5 : 60, // Max billing cycles
      quantity: 1,
      notes: {
        userId,
        planId,
        tierName,
        billingCycle,
        type: "subscription",
      },
      notify_info: userEmail
        ? { notify_email: userEmail }
        : undefined,
    } as any);

    console.log(
      `[Razorpay] Created subscription ${subscription.id} for ${tierName} ${billingCycle}`
    );

    return NextResponse.json({
      subscriptionId: subscription.id,
      keyId: process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
      planId: razorpayPlanId,
      tierName,
      billingCycle,
    });
  } catch (error: any) {
    console.error("[Razorpay] Create subscription error:", error);
    const desc =
      error?.error?.description ||
      error?.description ||
      error?.message ||
      (typeof error === "string" ? error : JSON.stringify(error));

    const isAuthError = desc.toLowerCase().includes("authentication failed") || error?.statusCode === 401;

    const message = isAuthError
      ? "Razorpay authentication failed (401). Please check your Key ID & Key Secret in .env.local (from dashboard.razorpay.com -> Settings -> API Keys)."
      : `Failed to create subscription: ${desc}`;

    return NextResponse.json(
      { error: message },
      { status: isAuthError ? 401 : 500 }
    );
  }
}
