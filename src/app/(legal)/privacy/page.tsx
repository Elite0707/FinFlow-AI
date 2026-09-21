import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy & DPDP Compliance | FinFlow AI',
  description: 'Privacy Policy and Digital Personal Data Protection (DPDP) Act compliance guidelines for FinFlow AI.',
};

export default function PrivacyPage() {
  return (
    <article className="max-w-none space-y-8">
      {/* Header Badge */}
      <div className="border-b border-border/60 pb-8">
        <span className="px-3 py-1 text-xs font-medium uppercase tracking-wider text-primary bg-primary/10 border border-primary/20 rounded-full">
          Data Privacy &amp; Protection
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-foreground mt-4 tracking-[-0.02em]">
          Privacy Policy &amp; DPDP Act Compliance
        </h1>
        <p className="text-muted-foreground text-sm mt-2 font-normal">
          Effective Date: September 20, 2026 | Compliant with India DPDP Act 2023
        </p>
      </div>

      <div className="space-y-8 text-muted-foreground leading-relaxed text-sm sm:text-base">
        <section className="bg-card/60 p-6 rounded-2xl border border-border/80">
          <h2 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
            <span className="text-primary">1.</span> Commitment to Data Privacy
          </h2>
          <p>
            At <strong className="text-foreground">FinFlow AI</strong>, we prioritize the confidentiality and integrity of your personal and financial data. This Privacy Policy details how we collect, process, store, and safeguard your data in strict compliance with the <strong className="text-foreground">Digital Personal Data Protection (DPDP) Act, 2023</strong> of India and international data protection standards.
          </p>
        </section>

        <section className="bg-card/60 p-6 rounded-2xl border border-border/80">
          <h2 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
            <span className="text-primary">2.</span> Zero Data Retention for Document Compute
          </h2>
          <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 text-primary text-sm mb-4">
            <strong className="font-semibold block mb-1">🛡️ Privacy-First Processing Architecture:</strong>
            Financial document files (invoices, receipts, tax statements) uploaded to FinFlow AI are processed ephemerally for the sole purpose of extracting structured JSON data requested by you.
          </div>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>Uploaded document files are never used to train public foundational AI models.</li>
            <li>Raw uploaded document files are stored securely with encryption and can be purged at any time from your dashboard or upon account deletion.</li>
            <li>Extracted JSON datasets remain strictly accessible only to your authenticated user account.</li>
          </ul>
        </section>

        <section className="bg-card/60 p-6 rounded-2xl border border-border/80">
          <h2 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
            <span className="text-primary">3.</span> Information We Collect
          </h2>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li><strong className="text-foreground">Account Data:</strong> Email address, User ID, company name (if provided), and authentication tokens (via Firebase Auth).</li>
            <li><strong className="text-foreground">Transactional Data:</strong> Payment ID references, credit purchasing logs, subscription status, and billing tax location (processed via Razorpay). We do not store raw credit card numbers or UPI PINs.</li>
            <li><strong className="text-foreground">Audit &amp; Usage Logs:</strong> IP addresses, browser user-agents, batch job processing timestamps, and credit deduction tallies maintained for dispute resolution and security auditing.</li>
          </ul>
        </section>

        <section className="bg-card/60 p-6 rounded-2xl border border-border/80">
          <h2 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
            <span className="text-primary">4.</span> Your Rights under DPDP Act 2023
          </h2>
          <p>
            As a Data Principal under Indian law, you possess explicit rights regarding your personal data:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-sm">
            <div className="p-4 rounded-xl bg-background border border-border">
              <strong className="text-foreground block mb-1">Right to Access &amp; Summary</strong>
              <span className="text-muted-foreground">Request a complete summary of personal data processed by FinFlow AI.</span>
            </div>
            <div className="p-4 rounded-xl bg-background border border-border">
              <strong className="text-foreground block mb-1">Right to Correction &amp; Erasure</strong>
              <span className="text-muted-foreground">Request correction of inaccurate data or complete deletion of your account.</span>
            </div>
            <div className="p-4 rounded-xl bg-background border border-border">
              <strong className="text-foreground block mb-1">Right of Grievance Redressal</strong>
              <span className="text-muted-foreground">Access ready grievance resolution mechanisms for data privacy concerns.</span>
            </div>
            <div className="p-4 rounded-xl bg-background border border-border">
              <strong className="text-foreground block mb-1">Right to Nominate</strong>
              <span className="text-muted-foreground">Nominate any individual to exercise data principal rights in case of incapacity.</span>
            </div>
          </div>
        </section>

        <section className="bg-card/60 p-6 rounded-2xl border border-border/80">
          <h2 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
            <span className="text-primary">5.</span> Security &amp; Encryption Standards
          </h2>
          <p>
            All data transfers operate over <strong className="text-foreground">TLS 1.3 encryption</strong> in transit and <strong className="text-foreground">AES-256 bit encryption</strong> at rest. Cloud database infrastructure is hosted in enterprise-grade Google Cloud Platform datacenter environments with strict IAM role controls.
          </p>
        </section>

        <section className="bg-card/60 p-6 rounded-2xl border border-border/80">
          <h2 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
            <span className="text-primary">6.</span> Designated Grievance Officer
          </h2>
          <p>
            In accordance with the DPDP Act 2023 and Information Technology Act rules, you may contact our designated Data Protection &amp; Grievance Officer:
          </p>
          <div className="mt-4 p-4 rounded-xl bg-background border border-border text-sm space-y-1">
            <p><strong className="text-foreground">Grievance Officer:</strong> FinFlow AI Data Protection Desk</p>
            <p><strong className="text-foreground">Email:</strong> privacy@finflow.ai / grievance@finflow.ai</p>
            <p><strong className="text-foreground">Response SLA:</strong> Within 48 hours of receipt</p>
          </div>
        </section>
      </div>
    </article>
  );
}
