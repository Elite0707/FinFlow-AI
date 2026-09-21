'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  GoogleAuthProvider,
  linkWithPopup,
  linkWithCredential,
  EmailAuthProvider,
  updateProfile,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Loader2, ShieldCheck, Mail } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface LinkAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function LinkAccountModal({ isOpen, onClose, onSuccess }: LinkAccountModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();

  const handleGoogleLink = async () => {
    if (!auth.currentUser) return;
    setError('');
    setLoading(true);
    const provider = new GoogleAuthProvider();

    try {
      await linkWithPopup(auth.currentUser, provider);
      toast({
        title: '🎉 Account Linked Successfully!',
        description: 'All your guest extraction history and credits are now saved.',
        className: 'bg-emerald-600 text-white',
      });
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error('Google linking error:', err);
      if (err.code === 'auth/credential-already-in-use') {
        setError('This Google account is already linked to another FinFlow AI account. Please log in directly.');
      } else {
        setError(err.message || 'Failed to link Google account.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    setError('');
    setLoading(true);

    try {
      const credential = EmailAuthProvider.credential(email, password);
      const result = await linkWithCredential(auth.currentUser, credential);

      if (name.trim()) {
        await updateProfile(result.user, { displayName: name.trim() });
      }

      toast({
        title: '🎉 Account Saved!',
        description: 'Your guest session has been converted to a permanent FinFlow AI account.',
        className: 'bg-emerald-600 text-white',
      });
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error('Email linking error:', err);
      if (err.code === 'auth/credential-already-in-use' || err.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists. Please log in instead.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password must be at least 6 characters.');
      } else {
        setError(err.message || 'Failed to save account with email.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card border-border text-foreground">
        <DialogHeader>
          <div className="mx-auto w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mb-2">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <DialogTitle className="text-center text-xl font-bold font-serif">
            Save Your Account &amp; History
          </DialogTitle>
          <DialogDescription className="text-center text-xs text-muted-foreground">
            Convert your guest trial into a permanent account. All your processed files, templates, and credits will be saved.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {error && (
            <Alert variant="destructive" className="py-2 text-xs">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            variant="outline"
            type="button"
            className="w-full h-10 text-xs font-medium border-border/80 bg-background hover:bg-muted/50"
            onClick={handleGoogleLink}
            disabled={loading}
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Save with Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/60" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or save with email</span>
            </div>
          </div>

          <form onSubmit={handleEmailLink} className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs">Your Name</Label>
              <Input
                type="text"
                placeholder="Rahul Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-9 text-xs bg-background border-border/80"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Email Address</Label>
              <Input
                type="email"
                required
                placeholder="rahul@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-9 text-xs bg-background border-border/80"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Create Password</Label>
              <Input
                type="password"
                required
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-9 text-xs bg-background border-border/80"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-9 text-xs font-medium bg-foreground text-background hover:bg-foreground/90 rounded-lg mt-2"
            >
              {loading ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Mail className="mr-2 h-3.5 w-3.5" />}
              Save Account &amp; Continue
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
