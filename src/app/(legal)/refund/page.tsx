import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Refund & Cancellation Policy | FinFlow AI',
  description: 'Refund, cancellation, and chargeback dispute policies for FinFlow AI subscriptions and credit top-ups.',
};

export default function RefundPage() {
  return (
    <article className="max-w-none space-y-8">
      {/* Header Badge */}
      <div className="border-b border-border/60 pb-8">
        <span className="px-3 py-1 text-xs font-medium uppercase tracking-wider text-primary bg-primary/10 border border-primary/20 rounded-full">
          Billing &amp; Payment Policy
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-foreground mt-4 tracking-[-0.02em]">
          Refund &amp; Cancellation Policy
        </h1>
        <p className="text-muted-foreground text-sm mt-2 font-normal">
          Effective Date: September 20, 2026 | Razorpay Merchant Policy Standard
        </p>
      </div>

      <div className="space-y-8 text-muted-foreground leading-relaxed text-sm sm:text-base">
        <section className="bg-card/60 p-6 rounded-2xl border border-border/80">
          <h2 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
            <span className="text-primary">1.</span> Digital Goods &amp; Credit Non-Refundability
          </h2>
          <p>
            FinFlow AI delivers digital SaaS products consisting of cloud GPU compute power, automated OCR processing, and document extraction API credits.
          </p>
          <div className="mt-4 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-200 text-sm">
            <strong className="font-semibold text-yellow-300 block mb-1">⚠️ Strict Non-Refundable Policy:</strong>
            Because API credits represent immediate, non-recoverable allocations of cloud infrastructure resources, <strong>all purchases of subscription plans and credit top-up packages are final and non-refundable once credits are provisioned or compute power has been consumed</strong>.
          </div>
        </section>

        <section className="bg-card/60 p-6 rounded-2xl border border-border/80">
          <h2 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
            <span className="text-primary">2.</span> Subscription Cancellations
          </h2>
          <p>
            You may cancel your recurring subscription plan at any time directly through your dashboard under <Link href="/dashboard/subscription" className="text-primary hover:underline">Subscription Settings</Link>.
          </p>
          <ul className="list-disc pl-6 mt-3 space-y-2 text-muted-foreground">
            <li><strong className="text-foreground">Effective Date:</strong> Upon cancellation, your subscription will not renew at the next billing date.</li>
            <li><strong className="text-foreground">Retention of Access:</strong> You will retain full access to your remaining plan credits and features until the conclusion of your current paid billing period.</li>
            <li><strong className="text-foreground">No Partial Refunds:</strong> We do not offer pro-rated refunds or credit cash-outs for unused portions of an active billing cycle.</li>
          </ul>
        </section>

        <section className="bg-card/60 p-6 rounded-2xl border border-border/80">
          <h2 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
            <span className="text-primary">3.</span> Chargeback &amp; Payment Dispute Policy
          </h2>
          <p>
            FinFlow AI maintains an immutable three-layer audit trail for every transaction and document processing request:
          </p>
          <ul className="list-disc pl-6 mt-3 space-y-2 text-muted-foreground">
            <li><strong className="text-foreground">Active Pre-Checkout Consent:</strong> Confirmation logs verifying explicit agreement to our non-refundable digital goods policy prior to Razorpay modal checkout.</li>
            <li><strong className="text-foreground">Immutable Compute Audit Logs:</strong> Cryptographic server logs documenting exact job execution timestamps, document IDs, page counts, and credit deductions.</li>
            <li><strong className="text-foreground">Automated Instant Email Delivery Proofs:</strong> Server-issued email fulfillment receipts sent to your account email upon successful payment webhook verification.</li>
          </ul>
          <p className="mt-4 text-xs text-muted-foreground/70 bg-background p-3 rounded-xl border border-border">
            In the event of an unwarranted payment dispute or chargeback attempt, these audit logs and electronic delivery records will be submitted directly to Razorpay and banking networks as binding proof of service delivery.
          </p>
        </section>

        <section className="bg-card/60 p-6 rounded-2xl border border-border/80">
          <h2 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
            <span className="text-primary">4.</span> Duplicate Charge Exceptions
          </h2>
          <p>
            In the rare event that your account is billed twice for a single transaction due to a payment gateway communication latency:
          </p>
          <ol className="list-decimal pl-6 mt-3 space-y-2 text-muted-foreground">
            <li>Contact our support team at <strong className="text-foreground">support@finflow.ai</strong> within 7 business days.</li>
            <li>Provide your Razorpay Payment ID (<code className="text-primary text-xs">pay_...</code>) and transaction receipt.</li>
            <li>Upon verification that no additional credits were consumed, a full refund of the duplicate charge will be processed within 5-7 business days back to your original payment source.</li>
          </ol>
        </section>
      </div>
    </article>
  );
}
