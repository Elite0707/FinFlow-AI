import { PricingPlan, CompetitorData } from './types';

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free Forever',
    description: 'The Hook',
    monthlyPrice: 0,
    yearlyPrice: 0,
    allowance: '10 Documents / Mo',
    features: [
      'Standard AI OCR',
      'Basic Export (JSON)',
      'Community Support',
      'Secure Cloud Storage'
    ],
    cta: 'Get Started Free',
    note: 'Perfect to test the workflow'
  },
  {
    id: 'starter',
    name: 'Starter',
    description: 'The Freelancer',
    monthlyPrice: 19,
    yearlyPrice: 15,
    allowance: '150 Documents / Mo',
    features: [
      '~450 Pages included',
      'Standard Support',
      'Personal Dashboard',
      'Direct API Access'
    ],
    cta: 'Start 7-Day Trial',
    note: 'Best for solo contractors'
  },
  {
    id: 'business',
    name: 'Business',
    description: 'The Sweet Spot',
    monthlyPrice: 49,
    yearlyPrice: 39,
    allowance: '1,000 Documents / Mo',
    features: [
      '6x volume vs Starter',
      'Priority Support (1h)',
      'Up to 3 Team Members',
      'Excel & CSV Export',
      '10% Rollover Credits'
    ],
    cta: 'Upgrade to Business',
    highlight: true,
    badge: 'Most Popular',
    note: 'Best for small firms'
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'The Anchor',
    monthlyPrice: 199,
    yearlyPrice: 165,
    allowance: '5,000+ Documents / Mo',
    features: [
      'Unlimited Team Members',
      'Custom SLA & Invoicing',
      'Dedicated Account Manager',
      'Audit Logs & SSO',
      'Full Compliance Package'
    ],
    cta: 'Contact Sales',
    note: 'Best for large organizations'
  }
];

export const COMPETITORS: CompetitorData[] = [
  {
    name: 'FinFlow AI (Business)',
    price: 49,
    allowance: '1,000 Documents',
    costPerDoc: '$0.049'
  },
  {
    name: 'DocuClipper (Basic)',
    price: 39,
    allowance: '40 Documents*',
    costPerDoc: '$0.975'
  },
  {
    name: 'AutoEntry',
    price: 60,
    allowance: '100 Documents',
    costPerDoc: '$0.600'
  }
];
