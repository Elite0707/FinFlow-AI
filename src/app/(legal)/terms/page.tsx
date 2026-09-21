import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Terms & Conditions | FinFlow AI',
  description: 'Terms of Service and Conditions of Use for FinFlow AI financial document processing platform.',
};

export default function TermsPage() {
  return (
    <article className="max-w-none space-y-8">
      {/* Header Badge */}
      <div className="border-b border-border/60 pb-8">
        <span className="px-3 py-1 text-xs font-medium uppercase tracking-wider text-primary bg-primary/10 border border-primary/20 rounded-full">
          Legal Agreement
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-foreground mt-4 tracking-[-0.02em]">
          Terms &amp; Conditions
        </h1>
        <p className="text-muted-foreground text-sm mt-2 font-normal">
          Effective Date: September 20, 2026 | Last Updated: September 20, 2026
        </p>
      </div>

      {/* Content Sections */}
      <div className="space-y-8 text-muted-foreground leading-relaxed text-sm sm:text-base">
        <section className="bg-card/60 p-6 rounded-2xl border border-border/80">
          <h2 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
            <span className="text-primary">1.</span> Acceptance of Terms
          </h2>
          <p>
            By creating an account, accessing, or using <strong className="text-foreground">FinFlow AI</strong> (operated by FinFlow AI Technologies), you explicitly agree to be bound by these Terms &amp; Conditions (&quot;Terms&quot;) and our <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>. If you do not agree to these terms, you must not access or use our services.
          </p>
        </section>

        <section className="bg-card/60 p-6 rounded-2xl border border-border/80">
          <h2 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
            <span className="text-primary">2.</span> Service Description
          </h2>
          <p>
            FinFlow AI provides automated Artificial Intelligence and Optical Character Recognition (OCR) software as a service (SaaS) for parsing, extracting, and structuring financial documents (invoices, receipts, tax statements, and bills).
          </p>
          <ul className="list-disc pl-6 mt-3 space-y-2 text-muted-foreground">
            <li>Services are delivered digitally via cloud API endpoints and web interface dashboards.</li>
            <li>Usage is metered through a digital credit allocation system tied to document processing.</li>
          </ul>
        </section>

        <section className="bg-card/60 p-6 rounded-2xl border border-border/80">
          <h2 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
            <span className="text-primary">3.</span> Credit Metering &amp; Payment Terms
          </h2>
          <p>
            All financial transactions are processed securely via PCI-DSS compliant payment gateways (Razorpay). 
          </p>
          <div className="mt-4 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-200 text-sm">
            <strong className="font-semibold text-yellow-300 block mb-1">⚡ Digital Goods &amp; Compute Non-Refundability Disclosure:</strong>
            AI credits represent immediate allocations of server compute capacity. Upon purchase, credits are provisioned instantly to your account. Used credits consumed during document parsing, OCR processing, or LLM evaluation are <strong>strictly non-refundable</strong> under any circumstances.
          </div>
          <ul className="list-disc pl-6 mt-4 space-y-2 text-muted-foreground">
            <li><strong className="text-foreground">GST &amp; Invoicing:</strong> Prices displayed are exclusive or inclusive of applicable Goods and Services Tax (GST) as specified during checkout. Tax invoices are issued upon successful transaction completion.</li>
            <li><strong className="text-foreground">Subscription Renewals:</strong> Monthly and annual recurring subscriptions automatically bill at the start of each billing cycle until cancelled by the user.</li>
          </ul>
        </section>

        <section className="bg-card/60 p-6 rounded-2xl border border-border/80">
          <h2 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
            <span className="text-primary">4.</span> AI Accuracy &amp; Verification Disclaimer
          </h2>
          <p>
            FinFlow AI utilizes state-of-the-art vision-language models for document information extraction. While our precision benchmarks exceed standard OCR tools, AI-generated outputs are probabilistic recommendations.
          </p>
          <p className="mt-3 text-muted-foreground">
            Users remain solely responsible for auditing, verifying, and approving extracted accounting data, party names, GSTIN identifiers, and monetary totals prior to filing tax returns or submitting financial ledgers. FinFlow AI does not provide licensed tax, legal, or accounting advice.
          </p>
        </section>

        <section className="bg-card/60 p-6 rounded-2xl border border-border/80">
          <h2 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
            <span className="text-primary">5.</span> Intellectual Property &amp; Data Security
          </h2>
          <p>
            You retain 100% ownership of all raw document files uploaded to FinFlow AI. We do not sell your data or use customer uploaded financial documents to train publicly available AI foundation models.
          </p>
        </section>

        <section className="bg-card/60 p-6 rounded-2xl border border-border/80">
          <h2 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
            <span className="text-primary">6.</span> Governing Law &amp; Jurisdiction
          </h2>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising out of or in connection with these Terms shall be subject to the exclusive jurisdiction of the competent courts in India.
          </p>
        </section>
      </div>
    </article>
  );
}
