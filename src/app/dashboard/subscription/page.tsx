"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Zap, Calendar, Coins, ArrowUpRight, Sparkles, Loader2 } from "lucide-react";
import { useFirestore, getTotalCredits } from "@/hooks/useFirestore";
import { format } from "date-fns";
import { PRICING_PLANS } from "@/app/pricing/constants";
import { TOPUP_BUNDLES, TopUpBundle } from "@/app/pricing/topup-constants";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { auth } from "@/lib/firebase";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function SubscriptionPage() {
  const { stats, usage, subscriptions, loading, user } = useFirestore();
  const { toast } = useToast();
  const [buyingBundleId, setBuyingBundleId] = useState<string | null>(null);

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window !== "undefined" && window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleBuyTopUp = async (bundle: TopUpBundle) => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      toast({ title: "Authentication required", description: "Please sign in to buy credits." });
      return;
    }

    setBuyingBundleId(bundle.id);
    try {
      // Lazy load Razorpay script on demand
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        throw new Error("Failed to load payment gateway SDK. Please check your internet connection.");
      }

      // 1. Create order on backend
      const res = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bundleId: bundle.id,
          userId: currentUser.uid,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create order");
      }

      const { orderId, keyId, amount, currency } = await res.json();

      // 2. Open Razorpay Checkout Modal
      const options = {
        key: (keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "").replace(/^["']|["']$/g, "").trim(),
        amount,
        currency,
        name: "FinFlow AI",
        description: `Top-Up: ${bundle.label} (${bundle.credits} Credits)`,
        order_id: orderId,
        handler: function () {
          toast({
            title: "🎉 Top-Up Purchased!",
            description: `${bundle.credits} credits will be added to your account momentarily.`,
            className: "bg-green-500 text-white",
          });
        },
        prefill: {
          email: currentUser.email || "",
        },
        theme: {
          color: "#10b981",
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
            setBuyingBundleId(null);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        setBuyingBundleId(null);
        toast({
          title: "Payment Error",
          description: response.error?.description || "Razorpay rejected the payment key. Please verify your Key ID in dashboard.razorpay.com",
          variant: "destructive",
        });
      });
      rzp.open();
    } catch (err) {
      console.error("Top-up purchase failed:", err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Payment failed. Please try again.",
      });
    } finally {
      setBuyingBundleId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 max-w-5xl mx-auto">
        <div>
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-4 w-96 mt-2" />
        </div>
        <div className="grid md:grid-cols-2 gap-8 items-start">
          <Card className="border-primary/50 bg-primary/5">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-28" />
                <Skeleton className="h-5 w-14 rounded-full" />
              </div>
              <Skeleton className="h-4 w-60 mt-1" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-44" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Find current plan details from constants
  const currentPlanId = stats?.subscriptionTier ? stats.subscriptionTier.toLowerCase() : "free";
  const planDetails = PRICING_PLANS.find((p) => p.id === currentPlanId) || PRICING_PLANS[0];

  const totalCredits = getTotalCredits(stats);
  const monthlyCredits = stats?.monthlyCreditsRemaining ?? 10;
  const rolloverCredits = stats?.rolloverCreditsRemaining ?? 0;
  const topUpCredits = stats?.topUpCreditsRemaining ?? 0;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Subscription & Credit Balance</h1>
        <p className="text-muted-foreground mt-1">Manage your plan, top-up credit bundles, and usage limits.</p>
      </div>

      {/* Credit Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-primary/10 border-primary/30 relative overflow-hidden">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase font-bold tracking-wider text-primary">
              Total Available Credits
            </CardDescription>
            <CardTitle className="text-3xl font-extrabold text-foreground flex items-center gap-2">
              <Coins className="h-7 w-7 text-primary" />
              {totalCredits.toLocaleString("en-IN")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">1 credit = up to 5 pages</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase font-bold tracking-wider">
              Monthly Plan Credits
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-foreground">
              {monthlyCredits.toLocaleString("en-IN")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Resets each cycle</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase font-bold tracking-wider flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-emerald-500" />
              Rollover Credits
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-emerald-500">
              {rolloverCredits.toLocaleString("en-IN")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">10% rolled over monthly</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase font-bold tracking-wider">
              Top-Up Credits
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-foreground">
              {topUpCredits.toLocaleString("en-IN")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Non-expiring balance</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-start">
        {/* Current Plan */}
        <Card className="border-primary/50 bg-primary/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Zap className="h-32 w-32" />
          </div>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Current Plan</CardTitle>
              <Badge className="bg-primary text-primary-foreground hover:bg-primary/90">
                {stats?.subscriptionTier || "Free"}
              </Badge>
            </div>
            <CardDescription>{planDetails.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Monthly Allocation</span>
                <span className="font-bold">{planDetails.allowance}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Total Documents Processed</span>
                <span className="font-bold">{stats?.totalDocumentsProcessed || 0}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Total Pages Processed</span>
                <span className="font-bold">{stats?.totalPagesProcessed || 0}</span>
              </div>
            </div>
            <div className="pt-4 space-y-2">
              {planDetails.features.slice(0, 4).map((feature, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Link href="/pricing?source=subscription" className="w-full">
              <Button variant="outline" className="w-full bg-background">
                {stats?.subscriptionTier === "Free" ? "Upgrade Plan" : "Change Plan"}
              </Button>
            </Link>
          </CardFooter>
        </Card>

        {/* Enterprise Card */}
        <Card>
          <CardHeader>
            <CardTitle>Need Enterprise Scale?</CardTitle>
            <CardDescription>Custom SLA, dedicated account manager, and 5,000+ monthly credits.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span>5,000+ Credits / Month</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span>Custom API & Direct Database Integration</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span>Dedicated Account Manager & Audit Logs</span>
            </div>
          </CardContent>
          <CardFooter>
            <a
              href="mailto:sales@finflow.ai?subject=Enterprise%20Plan%20Inquiry"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full"
            >
              <Button className="w-full" variant="secondary">
                Contact Enterprise Sales <ArrowUpRight className="h-4 w-4 ml-1" />
              </Button>
            </a>
          </CardFooter>
        </Card>
      </div>

      {/* Buy Top-Up Credits Section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Buy Top-Up Credit Bundles</h2>
          <p className="text-sm text-muted-foreground">
            Running low on credits? Purchase top-up bundles that never expire.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TOPUP_BUNDLES.map((bundle) => (
            <Card
              key={bundle.id}
              className={`relative flex flex-col justify-between ${
                "popular" in bundle && bundle.popular ? "border-primary shadow-md bg-primary/5" : ""
              }`}
            >
              {"popular" in bundle && bundle.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
                  Most Popular
                </Badge>
              )}
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>{bundle.label}</span>
                  <span className="text-xl font-extrabold">₹{bundle.priceINR}</span>
                </CardTitle>
                <CardDescription>{bundle.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Unit Cost</span>
                  <span className="font-semibold text-foreground">{bundle.perCredit} / credit</span>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Expiration</span>
                  <span className="font-semibold text-emerald-500">Never Expire</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={() => handleBuyTopUp(bundle)}
                  disabled={buyingBundleId === bundle.id}
                  className="w-full"
                  variant={"popular" in bundle && bundle.popular ? "default" : "outline"}
                >
                  {buyingBundleId === bundle.id ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Processing…
                    </>
                  ) : (
                    `Buy ${bundle.label} for ₹${bundle.priceINR}`
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      {/* Subscription History */}
      <Card>
        <CardHeader>
          <CardTitle>Billing & Subscription History</CardTitle>
          <CardDescription>Past subscription payments and top-up transactions</CardDescription>
        </CardHeader>
        <CardContent>
          {subscriptions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
              <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No billing history found.</p>
            </div>
          ) : (
            <div className="rounded-md border border-border overflow-hidden">
              <div className="grid grid-cols-4 p-4 font-medium text-sm bg-muted/50">
                <div>Date</div>
                <div>Plan / Item</div>
                <div>Status</div>
                <div className="text-right">Amount</div>
              </div>
              <div className="divide-y divide-border">
                {subscriptions.map((sub) => (
                  <div key={sub.id} className="grid grid-cols-4 p-4 text-sm">
                    <div>
                      {sub.createdAt?.seconds
                        ? format(new Date(sub.createdAt.seconds * 1000), "MMM d, yyyy")
                        : "Recent"}
                    </div>
                    <div>{sub.planName}</div>
                    <div>
                      <Badge variant="outline" className="capitalize">
                        {sub.status}
                      </Badge>
                    </div>
                    <div className="text-right">₹{sub.price?.toLocaleString("en-IN") || 0}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}