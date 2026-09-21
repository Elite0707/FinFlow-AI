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
  const price = isYearly
    ? Math.round(plan.yearlyPriceINR / (plan.id === 'free' ? 1 : (isYearly ? 10 : 1))) // Per-month equivalent
    : plan.monthlyPriceINR;
  const displayPrice = isYearly
    ? Math.round(plan.yearlyPriceINR / 10)
    : plan.monthlyPriceINR;

  return (
    <div className={`relative flex flex-col p-6 sm:p-7 rounded-2xl transition-all duration-300 border ${
      plan.highlight 
        ? 'bg-card border-primary shadow-xl shadow-primary/10 lg:scale-105 z-10' 
        : 'bg-card/60 border-border/80 shadow-sm hover:shadow-md'
    }`}>
      {plan.badge && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[11px] font-medium px-3 py-1 rounded-full tracking-wide shadow-sm">
          {plan.badge}
        </span>
      )}

      <div className="mb-5">
        <h3 className="text-xl font-semibold text-foreground mb-1 tracking-tight">{plan.name}</h3>
        <p className="text-xs text-muted-foreground font-normal">{plan.description}</p>
      </div>

      <div className="mb-6">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl sm:text-4xl font-semibold text-foreground tracking-tight">
            {plan.monthlyPriceINR === 0 ? 'Free' : `₹${displayPrice.toLocaleString('en-IN')}`}
          </span>
          {plan.monthlyPriceINR > 0 && (
            <span className="text-muted-foreground text-xs font-normal">/mo</span>
          )}
        </div>
        {isYearly && plan.monthlyPriceINR > 0 && (
          <p className="text-emerald-400 text-xs font-medium mt-1.5">
            Billed ₹{plan.yearlyPriceINR.toLocaleString('en-IN')}/yr (2 months free)
          </p>
        )}
      </div>

      <div className="mb-6 p-3.5 bg-background/60 rounded-xl border border-border/60">
        <p className="text-foreground font-semibold text-sm mb-0.5">{plan.allowance}</p>
        <p className="text-muted-foreground text-[11px] uppercase font-medium">
          {plan.monthlyCredits} Credits / Month
        </p>
      </div>

      <ul className="space-y-2.5 mb-7 flex-grow">
        {plan.features.map((feature, idx) => (
          <li key={idx} className="flex items-start gap-2.5 text-xs text-foreground/90">
            <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${plan.highlight ? 'text-primary' : 'text-muted-foreground'}`} />
            <span className="leading-tight">{feature}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={() => !isLoading && onSubscribe(plan)}
        disabled={isLoading}
        className={`w-full py-2.5 px-4 rounded-full font-medium text-xs transition-all ${
          plan.highlight 
            ? 'bg-foreground text-background hover:bg-foreground/90 shadow-sm disabled:opacity-60' 
            : 'bg-muted/70 text-foreground hover:bg-muted border border-border/60 disabled:opacity-60'
        }`}
      >
        {isLoading ? 'Processing…' : plan.cta}
      </button>

      <p className="mt-3.5 text-center text-[11px] text-muted-foreground/80 font-normal">
        {plan.note}
      </p>
    </div>
  );
};
