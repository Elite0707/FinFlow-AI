export enum BillingCycle {
  MONTHLY = "monthly",
  YEARLY = "yearly",
}

export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  monthlyPriceINR: number;
  yearlyPriceINR: number;
  monthlyCredits: number;
  allowance: string;
  features: string[];
  cta: string;
  note: string;
  highlight?: boolean;
  badge?: string;
  contactSales?: boolean; // If true, CTA opens email/form instead of checkout
}

export interface CompetitorData {
  name: string;
  price: number;
  allowance: string;
  costPerDoc: string;
}
