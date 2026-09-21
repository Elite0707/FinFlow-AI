'use client';

import React, { useState, useEffect, Suspense, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { auth } from '../../lib/firebase';
import { useFirestore } from '@/hooks/useFirestore';
import { useToast } from '../../components/ui/use-toast';
import { BillingCycle } from './types';
import { PRICING_PLANS } from './constants';
import { PlanCard } from './components/PlanCard';
import { ComparisonTable } from './components/ComparisonTable';
import { CheckoutConsentModal } from '@/components/CheckoutConsentModal';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';

declare global {
  interface Window {
    Razorpay: any;
  }
}

function PricingContent() {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>(BillingCycle.YEARLY);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [pendingPlan, setPendingPlan] = useState<typeof PRICING_PLANS[0] | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { user, loading } = useFirestore();
  const source = searchParams.get('source');

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window !== 'undefined' && window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const executeCheckout = async (plan: typeof PRICING_PLANS[0]) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    setSubmitting(plan.id);
    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        throw new Error('Failed to load Razorpay payment SDK.');
      }
      // 1. Create Razorpay Subscription on the server
      const response = await fetch('/api/razorpay/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: plan.id,
          billingCycle,
          userId: currentUser.uid,
          userEmail: currentUser.email,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.json();
        throw new Error(errorBody.error || 'Failed to create subscription');
      }

      const { subscriptionId, keyId } = await response.json();

      // 2. Open Razorpay checkout modal
      const options = {
        key: (keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "").replace(/^["']|["']$/g, "").trim(),
        subscription_id: subscriptionId,
        name: 'FinFlow AI',
        description: `${plan.name} Plan (${billingCycle === BillingCycle.YEARLY ? 'Yearly' : 'Monthly'})`,
        handler: async function (response: any) {
          try {
            await fetch("/api/razorpay/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                userId: currentUser.uid,
                type: "subscription",
                planId: plan.id,
                billingCycle: billingCycle === BillingCycle.YEARLY ? "yearly" : "monthly",
                razorpaySubscriptionId: response?.razorpay_subscription_id || subscriptionId,
                razorpayPaymentId: response?.razorpay_payment_id,
              }),
            });
          } catch (e) {
            console.error("Instant fulfillment error:", e);
          }

          toast({
            title: "🎉 Plan Activated!",
            description: `Welcome to the ${plan.name} plan!`,
            className: "bg-green-500 text-white",
          });
          setPendingPlan(null);
          setTimeout(() => router.push("/dashboard/subscription"), 1000);
        },
        prefill: {
          email: currentUser.email || '',
        },
        theme: {
          color: '#10b981',
        },
        method: {
          upi: true,
          card: true,
          netbanking: true,
          wallet: true,
        },
        retry: {
          enabled: false,
        },
        modal: {
          backdropclose: false,
          escape: true,
          handleback: true,
          ondismiss: function () {
            setSubmitting(null);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        setSubmitting(null);
        toast({
          title: "Payment Error",
          description: response.error?.description || "Razorpay rejected the payment key. Please verify your Key ID in dashboard.razorpay.com",
          variant: "destructive",
        });
      });
      rzp.open();
    } catch (err) {
      console.error('Subscribe failed:', err);
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Subscription failed. Please try again.',
      });
    } finally {
      setSubmitting(null);
    }
  };

  const handleSubscribe = useCallback((plan: typeof PRICING_PLANS[0]) => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      router.push('/login');
      return;
    }

    if (plan.id === 'free') {
      toast({ title: 'Success', description: `You're already on the Free plan` });
      return;
    }

    // Enterprise → Contact Sales
    if (plan.contactSales) {
      window.open(
        `mailto:sales@finflow.ai?subject=Enterprise%20Plan%20Inquiry&body=User%20ID:%20${currentUser.uid}%0AEmail:%20${currentUser.email}`,
        '_blank'
      );
      return;
    }

    // Open active consent modal first
    setPendingPlan(plan);
  }, [router, toast]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <SiteHeader />

      {/* Hero Section */}
      <header className="container mx-auto px-6 pt-16 pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-border/70 bg-card/60 text-xs font-normal text-muted-foreground mb-8 backdrop-blur-md">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-foreground font-medium">New</span>
          <span className="text-muted-foreground/50">—</span>
          <span>Rollover Credits on Business Plans</span>
        </div>
        <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-normal text-foreground tracking-[-0.03em] mb-6 leading-[1.12]">
          Pricing built for <br />
          <span className="italic font-normal text-muted-foreground/90">profit, not penalties.</span>
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto mb-10 font-normal leading-relaxed">
          Say goodbye to per-page billing. Handle thousands of documents with 94% better efficiency than traditional manual entry.
        </p>

        {/* Toggle */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <span className={`text-xs font-medium ${billingCycle === BillingCycle.MONTHLY ? 'text-foreground' : 'text-muted-foreground'}`}>Monthly</span>
          <button
            onClick={() => setBillingCycle(prev => prev === BillingCycle.MONTHLY ? BillingCycle.YEARLY : BillingCycle.MONTHLY)}
            className="w-12 h-6 bg-muted rounded-full p-0.5 relative transition-all duration-300 border border-border/80"
          >
            <div className={`w-5 h-5 bg-foreground rounded-full shadow-sm transform transition-transform duration-300 ${billingCycle === BillingCycle.YEARLY ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-medium ${billingCycle === BillingCycle.YEARLY ? 'text-foreground' : 'text-muted-foreground'}`}>Yearly</span>
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-medium px-2 py-0.5 rounded-full">2 Months Free</span>
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

      {/* Active Consent Checkout Modal */}
      {pendingPlan && (
        <CheckoutConsentModal
          isOpen={!!pendingPlan}
          onClose={() => setPendingPlan(null)}
          onConfirm={() => executeCheckout(pendingPlan)}
          title={`${pendingPlan.name} Plan`}
          description={`${billingCycle === BillingCycle.YEARLY ? 'Yearly' : 'Monthly'} Subscription (${pendingPlan.monthlyCredits} credits/mo)`}
          priceFormatted={`₹${(billingCycle === BillingCycle.YEARLY ? pendingPlan.yearlyPriceINR : pendingPlan.monthlyPriceINR).toLocaleString('en-IN')}`}
          loading={submitting === pendingPlan.id}
        />
      )}

      {/* Comparison & ROI */}
      <section className="container mx-auto px-6 py-24">
        <ComparisonTable />

        {/* ROI Spotlight */}
        <div className="mt-32 p-12 bg-secondary/30 border border-white/10 rounded-3xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-primary/20 rounded-full blur-3xl"></div>
          <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-serif text-3xl sm:text-4xl font-normal mb-6 text-foreground tracking-tight">The &quot;Business&quot; Psychology</h2>
              <p className="text-muted-foreground text-base sm:text-lg mb-8 leading-relaxed font-normal">
                Why do accountants love the <span className="text-primary font-medium">Business Plan</span>? It&apos;s simple math. For just ₹1,800 more than our Starter plan, you get <span className="text-primary font-medium italic">600% more volume.</span>
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-4 bg-background/50 p-4 rounded-2xl border border-white/5">
                  <div className="w-10 h-10 bg-green-500/20 text-green-300 rounded-lg flex items-center justify-center font-bold">10%</div>
                  <p className="text-sm font-medium text-foreground">Unused credits roll over to the next month.</p>
                </div>
                <div className="flex items-center gap-4 bg-background/50 p-4 rounded-2xl border border-white/5">
                  <div className="w-10 h-10 bg-primary/20 text-primary rounded-lg flex items-center justify-center font-bold">98%</div>
                  <p className="text-sm font-medium text-foreground">Typical profit margin for firms automating with us.</p>
                </div>
              </div>
            </div>
            <div className="bg-background/50 p-8 rounded-3xl border border-white/5 backdrop-blur-sm">
              <h3 className="text-xl font-bold mb-6 text-foreground">Fair Use Transparency</h3>
              <p className="text-muted-foreground text-sm mb-6">
                Most competitors charge by the page. We charge by credits to keep your billing predictable.
              </p>
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-white/10 pb-4">
                  <span className="text-muted-foreground">1 Credit =</span>
                  <span className="font-bold text-foreground">Up to 5 Pages</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/10 pb-4">
                  <span className="text-muted-foreground">6-Page Document</span>
                  <span className="font-bold text-foreground">2 Credits</span>
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
        <h2 className="font-serif text-3xl sm:text-4xl font-normal text-foreground mb-8 tracking-tight">Ready to reclaim your time?</h2>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/signup?plan=business">
            <button className="bg-foreground text-background px-7 py-3 rounded-full font-medium text-sm hover:bg-foreground/90 transition-all shadow-sm w-full sm:w-auto">
              Get Started with Business
            </button>
          </Link>
          <Link href="/contact">
            <button className="bg-card/40 text-foreground border border-border px-7 py-3 rounded-full font-medium text-sm hover:bg-muted/50 transition-all w-full sm:w-auto">
              Talk to an Expert
            </button>
          </Link>
        </div>
        <p className="mt-6 text-muted-foreground text-xs font-normal">No credit card required for Free Forever plan.</p>
      </section>

      <SiteFooter />
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
