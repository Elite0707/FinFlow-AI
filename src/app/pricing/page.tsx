import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle2, X } from "lucide-react";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 border-b border-white/5 bg-background/80 backdrop-blur-sm">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
             <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
               <span className="font-bold">D</span>
             </div>
             <span>FinFlow AI</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors">
              Log in
            </Link>
            <Link href="/signup">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="pt-32 pb-20 px-4 md:px-6">
        <div className="max-w-5xl mx-auto text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your business needs. No hidden fees.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Starter Plan */}
          <div className="relative rounded-2xl border border-border bg-card/50 p-8 shadow-lg hover:shadow-xl transition-shadow flex flex-col">
            <div className="mb-6">
              <h3 className="text-2xl font-bold">Starter</h3>
              <p className="text-muted-foreground mt-2">For freelancers and small tasks.</p>
            </div>
            <div className="mb-6">
              <span className="text-4xl font-bold">$0</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span>50 documents/month</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span>Standard processing speed</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span>3 saved templates</span>
              </li>
              <li className="flex items-center gap-3 text-muted-foreground">
                <X className="h-5 w-5" />
                <span>API Access</span>
              </li>
            </ul>
            <Link href="/signup">
              <Button variant="outline" className="w-full">Start for Free</Button>
            </Link>
          </div>

          {/* Pro Plan */}
          <div className="relative rounded-2xl border-2 border-primary bg-primary/5 p-8 shadow-2xl scale-105 z-10 flex flex-col">
             <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 rounded-bl-lg rounded-tr-lg text-xs font-bold uppercase tracking-wider">
               Popular
             </div>
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-primary">Pro</h3>
              <p className="text-muted-foreground mt-2">For growing businesses.</p>
            </div>
            <div className="mb-6">
              <span className="text-4xl font-bold">$49</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span>1,000 documents/month</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span>Priority processing</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span>Unlimited templates</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span>Export to Excel/CSV/JSON</span>
              </li>
            </ul>
            <Link href="/signup?plan=pro">
              <Button className="w-full">Get Started</Button>
            </Link>
          </div>

          {/* Enterprise Plan */}
          <div className="relative rounded-2xl border border-border bg-card/50 p-8 shadow-lg hover:shadow-xl transition-shadow flex flex-col">
            <div className="mb-6">
              <h3 className="text-2xl font-bold">Enterprise</h3>
              <p className="text-muted-foreground mt-2">For large scale operations.</p>
            </div>
            <div className="mb-6">
              <span className="text-4xl font-bold">Custom</span>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span>Unlimited documents</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span>Custom API integration</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span>Dedicated account manager</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span>SLA Guarantees</span>
              </li>
            </ul>
            <Link href="/contact">
              <Button variant="outline" className="w-full">Contact Sales</Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
