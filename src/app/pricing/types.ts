export enum BillingCycle {
  MONTHLY = "monthly",
  YEARLY = "yearly",
}

export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  allowance: string;
  features: string[];
  cta: string;
  note: string;
  highlight?: boolean;
  badge?: string;
}

export interface CompetitorData {
  name: string;
  price: number;
  allowance: string;
  costPerDoc: string;
}
