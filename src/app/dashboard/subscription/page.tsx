import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Zap } from "lucide-react";

export default function SubscriptionPage() {
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
              <Badge className="bg-primary text-primary-foreground hover:bg-primary/90">Pro</Badge>
            </div>
            <CardDescription>You are currently on the Pro Tier</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Monthly Credits</span>
                <span className="font-bold">850 / 1000</span>
              </div>
              <div className="h-2 w-full bg-background rounded-full overflow-hidden">
                <div className="h-full bg-primary w-[85%] rounded-full"></div>
              </div>
              <p className="text-xs text-muted-foreground">Credits renew on Nov 12, 2023</p>
            </div>
            <div className="pt-4 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>1000 Document Credits/mo</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>Advanced AI Extraction</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>Priority Support</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full bg-background">Manage Subscription</Button>
          </CardFooter>
        </Card>

        {/* Upgrade Options */}
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
            <Button className="w-full">Contact Sales</Button>
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
           <div className="rounded-md border border-border">
            <div className="grid grid-cols-4 p-4 font-medium text-sm bg-muted/50">
              <div>Period</div>
              <div>Plan</div>
              <div>Credits Used</div>
              <div className="text-right">Amount</div>
            </div>
            <div className="divide-y divide-border">
              <div className="grid grid-cols-4 p-4 text-sm">
                <div>Oct 1 - Oct 31</div>
                <div>Pro Tier</div>
                <div>945 / 1000</div>
                <div className="text-right">$49.00</div>
              </div>
              <div className="grid grid-cols-4 p-4 text-sm">
                <div>Sep 1 - Sep 30</div>
                <div>Pro Tier</div>
                <div>820 / 1000</div>
                <div className="text-right">$49.00</div>
              </div>
              <div className="grid grid-cols-4 p-4 text-sm">
                <div>Aug 1 - Aug 31</div>
                <div>Starter</div>
                <div>250 / 250</div>
                <div className="text-right">$19.00</div>
              </div>
            </div>
           </div>
        </CardContent>
      </Card>
    </div>
  );
}