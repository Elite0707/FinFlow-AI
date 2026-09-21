'use client';

import React, { useState } from 'react';
import { useFirestore } from '@/hooks/useFirestore';
import { LinkAccountModal } from '@/components/LinkAccountModal';
import { Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

export function SaveAccountBanner() {
  const { user } = useFirestore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Only show banner if user is signed in anonymously
  if (!user || !user.isAnonymous) {
    return null;
  }

  return (
    <>
      <div className="bg-gradient-to-r from-purple-950/80 via-indigo-950/80 to-purple-950/80 border-b border-primary/30 px-4 py-2.5 text-xs text-foreground flex items-center justify-between gap-4 backdrop-blur-md sticky top-16 z-10 shadow-sm">
        <div className="flex items-center gap-2 max-w-2xl">
          <div className="h-5 w-5 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0">
            <Sparkles className="h-3 w-3" />
          </div>
          <p className="text-muted-foreground">
            <span className="font-semibold text-foreground">Guest Trial Active:</span> You have{' '}
            <strong className="text-emerald-400">10 free credits</strong> to extract invoices. Link your account to permanently save your files and export history.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all text-xs shadow-sm"
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Save Account</span>
          <ArrowRight className="h-3 w-3" />
        </button>
      </div>

      <LinkAccountModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
