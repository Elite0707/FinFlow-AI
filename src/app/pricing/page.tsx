'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { auth, db } from '../../lib/firebase';
import { useFirestore } from '@/hooks/useFirestore';
import {
  collection,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { useToast } from '../../components/ui/use-toast';
import { BillingCycle } from './types';
import { PRICING_PLANS } from './constants';
import { PlanCard } from './components/PlanCard';
import { ComparisonTable } from './components/ComparisonTable';

function PricingContent() {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>(BillingCycle.YEARLY);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { user, loading } = useFirestore();
  const source = searchParams.get('source');

  const handleSubscribe = async (plan: typeof PRICING_PLANS[0]) => {
    const user = auth.currentUser;
    if (!user) {
      router.push('/login');
      return;
    }

    if (plan.id === 'free') {
      // Free plan - just show success toast
      toast({ title: 'Success', description: `You're now on the ${plan.name} plan` });
      return;
    }

    setSubmitting(plan.id);
    try {
      await addDoc(collection(db, 'subscriptions'), {
        userId: user.uid,
        planId: plan.id,
        planName: plan.name,
        price: billingCycle === BillingCycle.YEARLY ? plan.yearlyPrice : plan.monthlyPrice,
        billingCycle,
        status: 'active',
        createdAt: serverTimestamp(),
      });
      toast({
        title: 'Subscribed Successfully',
        description: `You've upgraded to ${plan.name}`
      });
    } catch (err) {
      console.error('Subscribe failed', err);
      toast({ title: 'Error', description: 'Subscription failed. Please try again.' });
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-8 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground shadow-lg">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" />
              <path d="M2 17L12 22L22 17" />
              <path d="M2 12L12 17L22 12" />
            </svg>
          </div>
          <span className="text-2xl font-bold text-foreground tracking-tight">
            FinFlow <span className="text-primary">AI</span>
          </span>
        </Link>

        {/* Conditional Navigation */}
        <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-muted-foreground">
          {!loading && (
            <>
              {!user ? (
                // Guest View
                <>
                  <Link href="/" className="hover:text-foreground transition-colors">Go to Main Page</Link>
                  <Link href="/login" className="text-foreground hover:text-primary transition-colors">Sign In</Link>
                </>
              ) : (
                // Logged In View
                <>
                  {source && (
                    <button
                      onClick={() => router.back()}
                      className="hover:text-foreground transition-colors"
                    >
                      Go Back
                    </button>
                  )}
                  <Link href="/dashboard" className="button-primary px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                    Dashboard
                  </Link>
                </>
              )}
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <header className="container mx-auto px-6 pt-16 pb-24 text-center">
        <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary px-4 py-2 rounded-full text-sm font-bold mb-8">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/40"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          New: Rollover Credits on Business Plans
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-foreground tracking-tight mb-8 leading-tight">
          Pricing Built for <br />
          <span className="text-primary">Profit, Not Penalties.</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12">
          Say goodbye to per-page billing. Handle thousands of documents with 94% better efficiency than traditional manual entry.
        </p>

        {/* Toggle */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <span className={`text-sm font-bold ${billingCycle === BillingCycle.MONTHLY ? 'text-foreground' : 'text-muted-foreground'}`}>Monthly</span>
          <button
            onClick={() => setBillingCycle(prev => prev === BillingCycle.MONTHLY ? BillingCycle.YEARLY : BillingCycle.MONTHLY)}
            className="w-14 h-8 bg-muted rounded-full p-1 relative transition-all duration-300"
          >
            <div className={`w-6 h-6 bg-background rounded-full shadow-md transform transition-transform duration-300 ${billingCycle === BillingCycle.YEARLY ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-bold ${billingCycle === BillingCycle.YEARLY ? 'text-foreground' : 'text-muted-foreground'}`}>Yearly</span>
            <span className="bg-green-100 text-green-700 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full dark:bg-green-900 dark:text-green-200">Save 20%</span>
          </div>
        </div>
      </header>

      {/* Pricing Grid */}
      <section className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {PRICING_PLANS.map(plan => (
          <PlanCard
            key={plan.id}
            plan={plan}
            cycle={billingCycle}
            onSubscribe={handleSubscribe}
            isLoading={submitting === plan.id}
          />
        ))}
      </section>

      {/* Comparison & ROI */}
      <section className="container mx-auto px-6 py-24">
        <ComparisonTable />

        {/* ROI Spotlight */}
        <div className="mt-32 p-12 bg-secondary/30 border border-white/10 rounded-3xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-primary/20 rounded-full blur-3xl"></div>
          <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6 text-foreground">The "Business" Psychology</h2>
              <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                Why do accountants love the <span className="text-primary font-bold">Business Plan</span>? It's simple math. For just $30 more than our Starter plan, you get <span className="text-primary font-bold italic">600% more volume.</span>
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-4 bg-background/50 p-4 rounded-2xl border border-white/5">
                  <div className="w-10 h-10 bg-green-500/20 text-green-300 rounded-lg flex items-center justify-center font-bold">10%</div>
                  <p className="text-sm font-medium text-foreground">Unused credits roll over to the next month.</p>
                </div>
                <div className="flex items-center gap-4 bg-background/50 p-4 rounded-2xl border border-white/5">
                  <div className="w-10 h-10 bg-primary/20 text-primary rounded-lg flex items-center justify-center font-bold">94%</div>
                  <p className="text-sm font-medium text-foreground">Typical profit margin for firms automating with us.</p>
                </div>
              </div>
            </div>
            <div className="bg-background/50 p-8 rounded-3xl border border-white/5 backdrop-blur-sm">
              <h3 className="text-xl font-bold mb-6 text-foreground">Fair Use Transparency</h3>
              <p className="text-muted-foreground text-sm mb-6">
                Most competitors charge by the page. We charge by the document to keep your billing predictable.
              </p>
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-white/10 pb-4">
                  <span className="text-muted-foreground">1 Document =</span>
                  <span className="font-bold text-foreground">Up to 5 Pages</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/10 pb-4">
                  <span className="text-muted-foreground">Additional Pages</span>
                  <span className="font-bold text-foreground">0.2 Credits / Page</span>
                </div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                  *Protects you from large files while keeping marketing simple.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="container mx-auto px-6 py-20 text-center">
        <h2 className="text-4xl font-bold text-foreground mb-8">Ready to reclaim your time?</h2>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/signup?plan=business">
            <button className="bg-primary text-primary-foreground px-10 py-5 rounded-2xl font-bold text-lg hover:opacity-90 transition-all shadow-lg w-full sm:w-auto">
              Get Started with Business
            </button>
          </Link>
          <button className="bg-background text-foreground border-2 border-foreground/20 px-10 py-5 rounded-2xl font-bold text-lg hover:border-foreground/40 transition-all w-full sm:w-auto">
            Talk to an Expert
          </button>
        </div>
        <p className="mt-8 text-muted-foreground text-sm">No credit card required for Free Forever plan.</p>
      </section>

      <footer className="container mx-auto px-6 py-12 border-t border-border text-muted-foreground flex flex-col md:flex-row justify-between items-center gap-8">
        <Link href="/" className="flex items-center gap-2 opacity-70 hover:opacity-100 transition-opacity">
          <div className="w-8 h-8 bg-foreground rounded-lg flex items-center justify-center text-background">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" />
            </svg>
          </div>
          <span className="text-lg font-bold tracking-tight">FinFlow</span>
        </Link>
        <div className="flex gap-8 text-sm font-medium">
          <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-foreground transition-colors">Cookie Settings</a>
        </div>
        <div className="text-sm">
          © 2025 FinFlow AI Technologies Inc.
        </div>
      </footer>
    </div>
  );
}

export default function PricingPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PricingContent />
    </Suspense>
  );
}
