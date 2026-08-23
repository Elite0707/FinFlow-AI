'use client';

import React from 'react';
import { COMPETITORS } from '../constants';

export const ComparisonTable: React.FC = () => {
  return (
    <div className="mt-24 max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-foreground mb-4">You vs. The Competitors</h2>
        <p className="text-muted-foreground max-w-xl mx-auto">We stop the "Nickel and Diming". Compare our Business plan with leading competitors.</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-background shadow-lg">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-muted border-b border-border">
              <th className="px-6 py-4 font-bold text-foreground">Platform</th>
              <th className="px-6 py-4 font-bold text-foreground">Monthly Price</th>
              <th className="px-6 py-4 font-bold text-foreground">Docs Allowed</th>
              <th className="px-6 py-4 font-bold text-primary">Cost Per Doc</th>
            </tr>
          </thead>
          <tbody>
            {COMPETITORS.map((comp, idx) => (
              <tr 
                key={idx} 
                className={`border-b border-border last:border-0 hover:bg-muted/50 transition-colors ${
                  comp.name.includes('FinFlow') ? 'bg-primary/5' : ''
                }`}
              >
                <td className="px-6 py-4">
                  <span className={`font-bold ${comp.name.includes('FinFlow') ? 'text-primary' : 'text-foreground'}`}>
                    {comp.name}
                  </span>
                </td>
                <td className="px-6 py-4 text-foreground font-medium">₹{comp.price.toLocaleString('en-IN')}</td>
                <td className="px-6 py-4 text-foreground font-medium">{comp.allowance}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                    comp.name.includes('FinFlow') 
                      ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {comp.costPerDoc}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="bg-muted p-4">
          <p className="text-xs text-muted-foreground text-center italic">
            *Competitors often charge per &quot;page&quot;. We use a credit system (1 credit = up to 5 pages) for predictable billing.
          </p>
        </div>
      </div>
    </div>
  );
};
