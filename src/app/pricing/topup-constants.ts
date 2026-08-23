/**
 * Top-Up Credit Bundles — One-time Razorpay Orders (non-expiring credits)
 */
export const TOPUP_BUNDLES = [
  {
    id: "topup-50",
    credits: 50,
    priceINR: 199,
    pricePaise: 19900,
    perCredit: "₹3.98",
    label: "50 Credits",
    description: "Best for occasional extra batches",
  },
  {
    id: "topup-150",
    credits: 150,
    priceINR: 499,
    pricePaise: 49900,
    perCredit: "₹3.32",
    label: "150 Credits",
    description: "Most popular top-up",
    popular: true,
  },
  {
    id: "topup-500",
    credits: 500,
    priceINR: 1299,
    pricePaise: 129900,
    perCredit: "₹2.59",
    label: "500 Credits",
    description: "Best value per credit",
  },
] as const;

export type TopUpBundle = (typeof TOPUP_BUNDLES)[number];
