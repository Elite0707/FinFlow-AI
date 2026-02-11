
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle2, FileText, BarChart3, ShieldCheck, Zap } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Navbar */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
              <FileText className="h-5 w-5" />
            </div>
            <span>DocExtract AI</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <Link href="#features" className="hover:text-foreground transition-colors">Features</Link>
            <Link href="#how-it-works" className="hover:text-foreground transition-colors">How it Works</Link>
            <Link href="#pricing" className="hover:text-foreground transition-colors">Pricing</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" size="sm">Log in</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-background to-background opacity-50 -z-10"></div>
          <div className="container flex flex-col items-center text-center">
            <Badge variant="outline" className="mb-6 py-1.5 px-4 text-sm border-primary/20 bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
              <Zap className="mr-2 h-3 w-3 fill-current" />
              Intelligent Document Processing v2.0
            </Badge>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 max-w-4xl bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70">
              Transform Messy PDFs into <br className="hidden md:block" />
              <span className="text-primary">Structured Excel Data</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl leading-relaxed">
              Stop manual data entry. Upload invoices, bank statements, and reports. 
              Get clean, segregated Excel sheets instantly. Zero post-processing required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
              <Link href="/dashboard">
                <Button size="lg" className="w-full sm:w-auto text-base px-8 h-12 shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:shadow-[0_0_25px_rgba(124,58,237,0.5)] transition-all">
                  Start Extracting Now <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="w-full sm:w-auto text-base px-8 h-12">
                View Demo
              </Button>
            </div>

            {/* Stats/Social Proof */}
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 border-t border-border/50 pt-8 w-full max-w-4xl">
              <div className="flex flex-col items-center">
                <span className="text-3xl font-bold text-foreground">99.8%</span>
                <span className="text-sm text-muted-foreground uppercase tracking-wider mt-1">Accuracy</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-3xl font-bold text-foreground">50k+</span>
                <span className="text-sm text-muted-foreground uppercase tracking-wider mt-1">Docs Processed</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-3xl font-bold text-foreground">100x</span>
                <span className="text-sm text-muted-foreground uppercase tracking-wider mt-1">Faster</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-3xl font-bold text-foreground">Secure</span>
                <span className="text-sm text-muted-foreground uppercase tracking-wider mt-1">SOC2 Compliant</span>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-muted/30">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Built for Financial Precision</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Designed for accounting teams and operational staff who need accurate, ready-to-use data.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <Card className="bg-card/50 border-border/60 hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <BarChart3 className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Custom Extraction Rules</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Define exactly which fields to extract. Use column selection, keyword mapping, and AI-assisted suggestions to build reusable templates.
                  </CardDescription>
                </CardContent>
              </Card>

              {/* Feature 2 */}
              <Card className="bg-card/50 border-border/60 hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Batch Processing</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Upload multiple invoices at once. The system auto-detects unique entities and generates segregated sheets for each company.
                  </CardDescription>
                </CardContent>
              </Card>

              {/* Feature 3 */}
              <Card className="bg-card/50 border-border/60 hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <ShieldCheck className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Enterprise Security</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Bank-grade encryption for all files. Auto-deletion policies ensure your sensitive financial data never stays longer than needed.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Testimonial Section */}
        <section className="py-20">
          <div className="container max-w-4xl">
            <Card className="bg-gradient-to-br from-card to-card/50 border-primary/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <svg width="100" height="100" viewBox="0 0 24 24" fill="currentColor"><path d="M14.017 21L14.017 18C14.017 16.8954 13.1216 16 12.017 16H9C9.00001 15 9.00001 13 11 13C13 13 13.5 11.5 13.5 11.5L14.017 9H11C9 9 7 11 7 14V21H14.017ZM21.017 21L21.017 18C21.017 16.8954 20.1216 16 19.017 16H16C16 15 16 13 18 13C20 13 20.5 11.5 20.5 11.5L21.017 9H18C16 9 14 11 14 14V21H21.017Z"/></svg>
              </div>
              <CardContent className="p-10 md:p-14 text-center">
                <blockquote className="text-2xl md:text-3xl font-medium leading-normal mb-8 text-foreground">
                  "This tool has completely transformed our workflow. The design system is intuitive and the results are stunning. We've cut our processing time by 80%."
                </blockquote>
                <div className="flex items-center justify-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-secondary overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80" alt="Avatar" className="h-full w-full object-cover" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-foreground">Sarah Chen</div>
                    <div className="text-sm text-muted-foreground">CFO at TechFlow Inc.</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <footer className="py-10 border-t border-border/40 text-center text-sm text-muted-foreground">
        <div className="container">
          <p>&copy; 2024 DocExtract AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
