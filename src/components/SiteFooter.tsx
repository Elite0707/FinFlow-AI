import React from 'react';
import Link from 'next/link';
import { FileSpreadsheet, Send } from 'lucide-react';

export function SiteFooter() {
  return (
    <footer className="border-t border-border/40 bg-muted/30 pt-16 pb-12 text-xs text-muted-foreground">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Brand Column */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5 font-semibold text-lg text-foreground">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary via-purple-600 to-indigo-600 flex items-center justify-center text-primary-foreground shadow-md shadow-primary/20">
                <FileSpreadsheet className="h-4 w-4" />
              </div>
              <span>FinFlow<span className="text-primary font-bold">.AI</span></span>
            </div>
            <p className="text-xs text-muted-foreground max-w-sm leading-relaxed font-normal">
              Automated document extraction and buyer-wise ledger generation for modern financial teams and accountants.
            </p>
            {/* Newsletter Input */}
            <div className="pt-2 max-w-sm">
              <p className="font-medium text-foreground mb-2 text-xs">Subscribe to updates</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter your email..."
                  className="bg-card/60 border border-border/80 rounded-lg px-3 py-2 text-xs w-full focus:outline-none focus:border-primary text-foreground placeholder-muted-foreground/60"
                />
                <button className="bg-foreground hover:bg-foreground/90 text-background shrink-0 h-8 w-8 rounded-lg flex items-center justify-center transition-colors">
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Links Columns */}
          <div>
            <h4 className="font-semibold text-foreground mb-3 text-xs uppercase tracking-wider">Product</h4>
            <ul className="space-y-2.5">
              <li><a href="/#features" className="hover:text-foreground transition-colors">Overview</a></li>
              <li><a href="/#features" className="hover:text-foreground transition-colors">AI Extraction</a></li>
              <li><a href="/#features" className="hover:text-foreground transition-colors">Ledger Engine</a></li>
              <li><Link href="/pricing" className="hover:text-foreground transition-colors">Pricing Plans</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-3 text-xs uppercase tracking-wider">Resources</h4>
            <ul className="space-y-2.5">
              <li><a href="/#faq" className="hover:text-foreground transition-colors">Help Center</a></li>
              <li><a href="/#faq" className="hover:text-foreground transition-colors">Documentation</a></li>
              <li><Link href="/privacy" className="hover:text-foreground transition-colors">Security Policy</Link></li>
              <li><Link href="/contact" className="hover:text-foreground transition-colors">API Reference</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-3 text-xs uppercase tracking-wider">Company</h4>
            <ul className="space-y-2.5">
              <li><Link href="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link></li>
              <li><a href="/#testimonials" className="hover:text-foreground transition-colors">Testimonials</a></li>
              <li><a href="/#why-choose-us" className="hover:text-foreground transition-colors">Why FinFlow</a></li>
              <li><Link href="/contact" className="hover:text-foreground transition-colors">Contact Support</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>&copy; {new Date().getFullYear()} FinFlow AI. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link href="/refund" className="hover:text-foreground transition-colors">Refund Policy</Link>
            <Link href="/contact" className="hover:text-foreground transition-colors">Contact Us</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
