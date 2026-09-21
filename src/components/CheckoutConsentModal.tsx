'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface CheckoutConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  priceFormatted: string;
  loading?: boolean;
}

export function CheckoutConsentModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  priceFormatted,
  loading = false,
}: CheckoutConsentModalProps) {
  const [agreed, setAgreed] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!agreed) return;
    onConfirm();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-2xl shadow-primary/10 text-foreground space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Order Confirmation</h3>
              <p className="text-xs text-muted-foreground">Razorpay Secure Checkout</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg hover:bg-muted"
          >
            ✕
          </button>
        </div>

        {/* Item Summary */}
        <div className="bg-background border border-border rounded-2xl p-4 flex justify-between items-center">
          <div>
            <h4 className="font-semibold text-foreground">{title}</h4>
            <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
          </div>
          <div className="text-right">
            <span className="text-xl font-bold text-primary">{priceFormatted}</span>
            <span className="text-[10px] block text-muted-foreground/70">Includes GST</span>
          </div>
        </div>

        {/* Active Consent Checkbox */}
        <div className="bg-primary/5 border border-primary/30 rounded-2xl p-4 space-y-3">
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1 w-4 h-4 rounded accent-primary border-border bg-background cursor-pointer focus:ring-primary"
            />
            <span className="text-xs text-muted-foreground leading-relaxed">
              I have read and agree to the{' '}
              <Link href="/terms" target="_blank" className="text-primary font-semibold hover:underline">
                Terms &amp; Conditions
              </Link>{' '}
              and{' '}
              <Link href="/refund" target="_blank" className="text-primary font-semibold hover:underline">
                Refund Policy
              </Link>
              . I explicitly acknowledge that AI API credits represent immediate digital compute allocations that are{' '}
              <strong className="text-foreground underline">strictly non-refundable once used</strong>.
            </span>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={onClose}
            disabled={loading}
            className="w-1/3 py-3 rounded-xl border border-border text-muted-foreground font-semibold hover:bg-muted transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!agreed || loading}
            className={`w-2/3 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
              agreed && !loading
                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90'
                : 'bg-muted text-muted-foreground cursor-not-allowed border border-border/50'
            }`}
          >
            {loading ? (
              <span>Processing...</span>
            ) : (
              <>
                <span>Pay via Razorpay</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
