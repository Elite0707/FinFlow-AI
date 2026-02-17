"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Zap, Loader2, Calendar } from "lucide-react";
import { useFirestore } from "@/hooks/useFirestore";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";
import { PRICING_PLANS } from "@/app/pricing/constants";

export default function SubscriptionPage() {
  const { stats, usage, subscriptions, loading, user } = useFirestore();

  if (loading) {
    return <div className="p-8 text-center flex items-center justify-center gap-2">
      <Loader2 className="h-4 w-4 animate-spin" /> Loading subscription details...
    </div>;
  }

  // Find current plan details from constants
  const currentPlanId = stats?.subscriptionTier.toLowerCase() || "free";
  const planDetails = PRICING_PLANS.find(p => p.id === currentPlanId) || PRICING_PLANS[0];

  // Calculate usage percentage
  const usagePercentage = stats ? Math.min(100, ((1000 - stats.creditsRemaining) / 1000) * 100) : 0;
  const creditsUsed = stats ? 1000 - stats.creditsRemaining : 0;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Subscription & Billing</h1>
        <p className="text-muted-foreground mt-1">Manage your plan, payment methods, and usage limits.</p>
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
            <CardDescription>
              {planDetails.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Monthly Uploads</span>
                <span className="font-bold">{usage?.monthlyUploadCount || 0} / 10</span>
              </div>
              <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${(usage?.monthlyUploadCount || 0) >= 10
                    ? "bg-destructive"
                    : (usage?.monthlyUploadCount || 0) >= 8
                      ? "bg-yellow-500"
                      : "bg-primary"
                    }`}
                  style={{ width: `${Math.min(100, ((usage?.monthlyUploadCount || 0) / 10) * 100)}%` }}
                ></div>
              </div>
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>{(usage?.monthlyUploadCount || 0) >= 10 ? "Limit Reached" : "Refreshes monthly"}</span>
                {stats?.subscriptionTier === "Business" && (
                  <span className="text-emerald-500 font-medium flex items-center gap-1">
                    <Zap className="h-3 w-3" /> 10% Rollover Active
                  </span>
                )}
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
          <CardFooter>
            <Link href="/pricing?source=subscription" className="w-full">
              <Button variant="outline" className="w-full bg-background">
                {stats?.subscriptionTier === "Free" ? "Upgrade Plan" : "Change Plan"}
              </Button>
            </Link>
          </CardFooter>
        </Card>

        {/* Upgrade Options / Enterprise */}
        <Card>
          <CardHeader>
            <CardTitle>Upgrade to Enterprise</CardTitle>
            <CardDescription>For high-volume processing and custom integrations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>Unlimited Document Credits</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>Custom API Integration</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>Dedicated Account Manager</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>SLA Guarantees</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Link href="/pricing#enterprise" className="w-full">
              <Button className="w-full">Contact Sales</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>

      {/* Usage History */}
      <Card>
        <CardHeader>
          <CardTitle>Usage History</CardTitle>
          <CardDescription>Past billing cycles and credit consumption</CardDescription>
        </CardHeader>
        <CardContent>
          {subscriptions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
              <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No subscription history found.</p>
            </div>
          ) : (
            <div className="rounded-md border border-border overflow-hidden">
              <div className="grid grid-cols-4 p-4 font-medium text-sm bg-muted/50">
                <div>Date</div>
                <div>Plan</div>
                <div>Status</div>
                <div className="text-right">Amount</div>
              </div>
              <div className="divide-y divide-border">
                {subscriptions.map((sub) => (
                  <div key={sub.id} className="grid grid-cols-4 p-4 text-sm">
                    <div>
                      {sub.createdAt?.seconds
                        ? format(new Date(sub.createdAt.seconds * 1000), "MMM d, yyyy")
                        : "Unknown"}
                    </div>
                    <div>{sub.planName}</div>
                    <div>
                      <Badge variant="outline" className="capitalize">
                        {sub.status}
                      </Badge>
                    </div>
                    <div className="text-right">${sub.price}</div>
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