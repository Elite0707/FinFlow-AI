'use client';

import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'General Inquiry',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit inquiry.');
      }

      setSubmitted(true);
    } catch (err: any) {
      console.error('Contact submission error:', err);
      setError(err.message || 'Something went wrong. Please try again or email us directly.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <article className="max-w-none space-y-8">
      {/* Header */}
      <div className="border-b border-border/60 pb-8">
        <span className="px-3 py-1 text-xs font-medium uppercase tracking-wider text-primary bg-primary/10 border border-primary/20 rounded-full">
          Customer Support &amp; Assistance
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-foreground mt-4 tracking-[-0.02em]">
          Contact Us
        </h1>
        <p className="text-muted-foreground text-sm mt-2 font-normal">
          Have questions about FinFlow AI or need billing assistance? We are here to help.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Contact Info & Details */}
        <div className="space-y-6">
          <div className="bg-card/60 p-6 rounded-2xl border border-border/80">
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Support Channels
            </h2>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div>
                <span className="text-muted-foreground/70 block text-xs">Customer Support &amp; Billing Email</span>
                <a href="mailto:support@finflowai.com" className="text-primary font-semibold hover:underline">
                  support@finflowai.com
                </a>
              </div>
              <div>
                <span className="text-muted-foreground/70 block text-xs">Enterprise Sales &amp; Custom Plans</span>
                <a href="mailto:sales@finflowai.com" className="text-primary font-semibold hover:underline">
                  sales@finflowai.com
                </a>
              </div>
              <div>
                <span className="text-muted-foreground/70 block text-xs">Support Hours</span>
                <p className="font-medium text-foreground">Monday – Saturday: 9:00 AM – 7:00 PM IST</p>
              </div>
              <div>
                <span className="text-muted-foreground/70 block text-xs">Target SLA Response Time</span>
                <p className="font-medium text-foreground">Within 24 to 48 business hours</p>
              </div>
            </div>
          </div>

          <div className="bg-card/60 p-6 rounded-2xl border border-border/80">
            <h2 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Registered Address
            </h2>
            <div className="text-sm text-muted-foreground space-y-1">
              <p className="font-semibold text-foreground">FinFlow AI Technologies Private Limited</p>
              <p>Tech Park Tower, 4th Floor, Sector 62</p>
              <p>Noida, Uttar Pradesh – 201309, India</p>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-card/60 p-6 sm:p-8 rounded-2xl border border-border/80">
          <h2 className="text-xl font-bold text-foreground mb-4">Send us a message</h2>
          {submitted ? (
            <div className="p-6 rounded-xl bg-primary/10 border border-primary/20 text-primary text-center space-y-2">
              <svg className="w-12 h-12 text-primary mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="font-bold text-lg text-foreground">Message Received!</h3>
              <p className="text-xs text-muted-foreground">
                Thank you for contacting FinFlow AI. Our support team will reply to <strong className="text-foreground">{formData.email}</strong> within 24 to 48 hours. A confirmation has been sent to your inbox.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setFormData({ name: '', email: '', subject: 'General Inquiry', message: '' });
                }}
                className="mt-4 px-4 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Rahul Sharma"
                  className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-foreground placeholder-muted-foreground/50 focus:outline-none focus:border-primary transition-colors text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="rahul@company.com"
                  className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-foreground placeholder-muted-foreground/50 focus:outline-none focus:border-primary transition-colors text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Inquiry Category</label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-foreground focus:outline-none focus:border-primary transition-colors text-sm"
                >
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="Billing & Refund">Billing &amp; Refund Request</option>
                  <option value="Enterprise Sales">Enterprise Sales</option>
                  <option value="Data Privacy / DPDP">Data Privacy / DPDP Request</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Message</label>
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Describe how we can assist you..."
                  className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-foreground placeholder-muted-foreground/50 focus:outline-none focus:border-primary transition-colors text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-6 rounded-xl bg-primary font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Sending message...</span>
                  </>
                ) : (
                  <span>Submit Inquiry</span>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </article>
  );
}

