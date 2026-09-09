import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";

// Credit allocations per tier
const PLAN_CREDITS: Record<string, number> = {
  Free: 10,
  Starter: 150,
  Business: 1000,
  Enterprise: 5000,
};

// Monthly document upload limits per tier
const PLAN_UPLOAD_LIMITS: Record<string, number> = {
  Free: 10,
  Starter: 150,
  Business: 1000,
  Enterprise: 5000,
};

// Top-up bundle credit & price mapping
const BUNDLE_MAP: Record<string, { credits: number; priceINR: number }> = {
  topup_50: { credits: 50, priceINR: 199 },
  topup_150: { credits: 150, priceINR: 499 },
  topup_500: { credits: 500, priceINR: 1499 },
};

// Plan prices mapping (INR)
const PLAN_PRICES: Record<string, { monthly: number; yearly: number }> = {
  Starter: { monthly: 1199, yearly: 11990 },
  Business: { monthly: 2999, yearly: 29990 },
  Enterprise: { monthly: 12999, yearly: 129990 },
};

/**
 * POST /api/razorpay/verify-payment
 * Triggered by the client immediately upon Razorpay payment modal success.
 * Instantly fulfills credits, updates subscription status, and records transaction amount.
 */
export async function POST(req: Request) {
  try {
    const {
      userId,
      type,
      bundleId,
      planId,
      billingCycle,
      razorpayPaymentId,
      razorpayOrderId,
      razorpaySubscriptionId,
    } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const adminDb = getAdminDb();
    const statsRef = adminDb.collection("users").doc(userId).collection("stats").doc("overview");
    const usageRef = adminDb.collection("users").doc(userId).collection("stats").doc("usage");
    const txRef    = adminDb.collection("users").doc(userId).collection("transactions");

    // ─── TOP-UP CREDIT BUNDLE ────────────────────────────────────────────────
    if (type === "topup") {
      const bundle = BUNDLE_MAP[bundleId] || { credits: 50, priceINR: 199 };
      const creditsToAdd = bundle.credits;
      const amountINR = bundle.priceINR;

      const statsDoc = await statsRef.get();
      const currentTopUp = statsDoc.data()?.topUpCreditsRemaining ?? 0;

      await statsRef.set(
        { topUpCreditsRemaining: currentTopUp + creditsToAdd },
        { merge: true }
      );

      await txRef.add({
        type: "topup",
        credits: creditsToAdd,
        bundleId,
        amount: amountINR,
        currency: "INR",
        razorpayPaymentId: razorpayPaymentId || null,
        razorpayOrderId:   razorpayOrderId   || null,
        createdAt: new Date().toISOString(),
      });

      console.log(`[Fulfillment] +${creditsToAdd} topup credits (₹${amountINR}) → user ${userId}`);
      return NextResponse.json({ success: true, creditsAdded: creditsToAdd, amount: amountINR });
    }

    // ─── SUBSCRIPTION PLAN ───────────────────────────────────────────────────
    if (type === "subscription") {
      const tierName       = planId.charAt(0).toUpperCase() + planId.slice(1); // "starter" -> "Starter"
      const monthlyCredits = PLAN_CREDITS[tierName] ?? 150;
      const uploadLimit    = PLAN_UPLOAD_LIMITS[tierName] ?? 150;
      const isYearly       = billingCycle === "yearly";
      const priceConfig    = PLAN_PRICES[tierName] || { monthly: 1199, yearly: 11990 };
      const amountINR      = isYearly ? priceConfig.yearly : priceConfig.monthly;

      await statsRef.set(
        {
          subscriptionTier:          tierName,
          subscriptionId:            razorpaySubscriptionId || `sub_pending_${Date.now()}`,
          subscriptionStatus:        "active",
          billingCycle:              billingCycle || "monthly",
          monthlyCreditsRemaining:   monthlyCredits,
          rolloverCreditsRemaining:  0,
        },
        { merge: true }
      );

      await usageRef.set(
        { monthlyUploadCount: 0, monthlyUploadLimit: uploadLimit },
        { merge: true }
      );

      await txRef.add({
        type: "subscription_activated",
        tier: tierName,
        billingCycle: billingCycle || "monthly",
        credits: monthlyCredits,
        amount: amountINR,
        currency: "INR",
        razorpaySubscriptionId: razorpaySubscriptionId || null,
        razorpayPaymentId:      razorpayPaymentId      || null,
        createdAt: new Date().toISOString(),
      });

      console.log(`[Fulfillment] Activated ${tierName} (₹${amountINR}, ${monthlyCredits} credits) → user ${userId}`);
      return NextResponse.json({ success: true, tier: tierName, credits: monthlyCredits, amount: amountINR, uploadLimit });
    }

    return NextResponse.json({ error: "Invalid type. Must be 'topup' or 'subscription'." }, { status: 400 });

  } catch (error: any) {
    console.error("[Verify Payment Error]:", error);
    return NextResponse.json({ error: error.message || "Fulfillment failed" }, { status: 500 });
  }
}
