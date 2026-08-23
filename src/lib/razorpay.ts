import Razorpay from "razorpay";

let razorpayInstance: Razorpay | null = null;

/**
 * Lazy-initialized Razorpay SDK instance.
 * Uses RAZORPAY_KEY_ID + RAZORPAY_KEY_SECRET from environment.
 */
export function getRazorpay(): Razorpay {
  if (razorpayInstance) return razorpayInstance;

  const rawKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";
  const rawKeySecret = process.env.RAZORPAY_KEY_SECRET || "";

  const keyId = rawKeyId.replace(/^["']|["']$/g, "").trim();
  const keySecret = rawKeySecret.replace(/^["']|["']$/g, "").trim();

  if (!keyId || !keySecret) {
    throw new Error(
      "Missing Razorpay credentials. Set NEXT_PUBLIC_RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env.local"
    );
  }

  razorpayInstance = new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });

  return razorpayInstance;
}

/**
 * Razorpay Plan IDs — create these in the Razorpay Dashboard first.
 * Settings → Plans → Create Plan
 * Then paste the plan_xxx IDs here.
 */
export const RAZORPAY_PLAN_IDS: Record<string, { monthly?: string; yearly?: string }> = {
  Starter: {
    monthly: process.env.RAZORPAY_PLAN_STARTER_MONTHLY || "",
    yearly: process.env.RAZORPAY_PLAN_STARTER_YEARLY || "",
  },
  Business: {
    monthly: process.env.RAZORPAY_PLAN_BUSINESS_MONTHLY || "",
    yearly: process.env.RAZORPAY_PLAN_BUSINESS_YEARLY || "",
  },
  Enterprise: {
    monthly: process.env.RAZORPAY_PLAN_ENTERPRISE_MONTHLY || "",
    yearly: process.env.RAZORPAY_PLAN_ENTERPRISE_YEARLY || "",
  },
};
