'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowRight, Loader2 } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { signInAnonymously } from 'firebase/auth';

interface StartExtractingButtonProps {
  className?: string;
  size?: 'default' | 'sm' | 'lg' | 'icon';
  children?: React.ReactNode;
}

export function StartExtractingButton({
  className = '',
  size = 'lg',
  children,
}: StartExtractingButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleStart = async () => {
    setLoading(true);
    try {
      if (!auth.currentUser) {
        await signInAnonymously(auth);
      }
      router.push('/dashboard');
    } catch (err: any) {
      console.warn('Anonymous sign-in not available or disabled, redirecting to signup:', err);
      // If anonymous auth is disabled in Firebase console (auth/admin-restricted-operation), send to signup
      router.push('/signup');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      size={size}
      onClick={handleStart}
      disabled={loading}
      className={className}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          <span>Starting Free Trial...</span>
        </>
      ) : (
        children || (
          <>
            <span>Start Extracting Free</span>
            <ArrowRight className="ml-2 h-4 w-4" />
          </>
        )
      )}
    </Button>
  );
}
