'use client';

import React from 'react';
import { COMPETITORS } from '../constants';

export const ComparisonTable: React.FC = () => {
  return (
    <div className="mt-24 max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="font-serif text-3xl sm:text-4xl font-normal text-foreground mb-3 tracking-tight">You vs. the competition</h2>
        <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto font-normal">We stop the &quot;nickel and diming&quot;. Compare our Business plan with leading alternatives.</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border/80 bg-card/60 shadow-lg">
        <table className="w-full text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr className="bg-muted/40 border-b border-border/70 text-xs text-muted-foreground">
              <th className="px-6 py-3.5 font-medium">Platform</th>
              <th className="px-6 py-3.5 font-medium">Monthly Price</th>
              <th className="px-6 py-3.5 font-medium">Docs Allowed</th>
              <th className="px-6 py-3.5 font-medium text-primary">Cost Per Doc</th>
            </tr>
          </thead>
          <tbody>
            {COMPETITORS.map((comp, idx) => (
              <tr 
                key={idx} 
                className={`border-b border-border/40 last:border-0 hover:bg-muted/30 transition-colors ${
                  comp.name.includes('FinFlow') ? 'bg-primary/5' : ''
                }`}
              >
                <td className="px-6 py-3.5">
                  <span className={`font-semibold ${comp.name.includes('FinFlow') ? 'text-primary' : 'text-foreground'}`}>
                    {comp.name}
                  </span>
                </td>
                <td className="px-6 py-3.5 text-foreground font-medium">₹{comp.price.toLocaleString('en-IN')}</td>
                <td className="px-6 py-3.5 text-muted-foreground font-normal">{comp.allowance}</td>
                <td className="px-6 py-3.5">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    comp.name.includes('FinFlow') 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {comp.costPerDoc}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="bg-muted/30 p-3.5 border-t border-border/40">
          <p className="text-[11px] text-muted-foreground text-center font-normal">
            *Competitors often charge per &quot;page&quot;. We use a credit system (1 credit = up to 5 pages) for predictable billing.
          </p>
        </div>
      </div>
    </div>
  );
};
