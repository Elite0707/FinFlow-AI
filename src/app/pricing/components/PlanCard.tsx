'use client';

import React from 'react';
import { PricingPlan, BillingCycle } from '../types';
import { Check } from 'lucide-react';

interface PlanCardProps {
  plan: PricingPlan;
  cycle: BillingCycle;
  onSubscribe: (plan: PricingPlan) => void;
  isLoading: boolean;
}

export const PlanCard: React.FC<PlanCardProps> = ({ plan, cycle, onSubscribe, isLoading }) => {
  const isYearly = cycle === BillingCycle.YEARLY;
  const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
  const totalYearly = plan.yearlyPrice * 12;

  return (
    <div className={`relative flex flex-col p-8 rounded-2xl transition-all duration-300 border ${
      plan.highlight 
        ? 'bg-primary/5 border-primary shadow-xl scale-105 z-10' 
        : 'bg-background border-border shadow-sm hover:shadow-md'
    }`}>
      {plan.badge && (
        <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest">
          {plan.badge}
        </span>
      )}

      <div className="mb-6">
        <h3 className="text-2xl font-bold text-foreground mb-1">{plan.name}</h3>
        <p className="text-sm text-muted-foreground font-medium">{plan.description}</p>
      </div>

      <div className="mb-8">
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold text-foreground tracking-tight">
            ${price}
          </span>
          <span className="text-muted-foreground font-medium">/mo</span>
        </div>
        {isYearly && plan.monthlyPrice > 0 && (
          <p className="text-primary text-xs font-semibold mt-2">
            Billed ${totalYearly}/yr (Save 20%)
          </p>
        )}
      </div>

      <div className="mb-8 p-4 bg-muted rounded-xl border border-border">
        <p className="text-foreground font-bold text-lg mb-1">{plan.allowance}</p>
        <p className="text-muted-foreground text-xs uppercase font-semibold">Usage Allowance</p>
      </div>

      <ul className="space-y-3 mb-8 flex-grow">
        {plan.features.map((feature, idx) => (
          <li key={idx} className="flex items-start gap-3 text-sm text-foreground">
            <Check className={`w-5 h-5 mt-0.5 flex-shrink-0 ${plan.highlight ? 'text-primary' : 'text-muted-foreground'}`} />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={() => !isLoading && onSubscribe(plan)}
        disabled={isLoading}
        className={`w-full py-3 px-6 rounded-lg font-bold transition-all ${
          plan.highlight 
            ? 'bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-60' 
            : 'bg-muted text-foreground hover:bg-muted/80 disabled:opacity-60'
        }`}
      >
        {isLoading ? 'Processing…' : plan.cta}
      </button>

      <p className="mt-4 text-center text-xs text-muted-foreground italic">
        {plan.note}
      </p>
    </div>
  );
};
