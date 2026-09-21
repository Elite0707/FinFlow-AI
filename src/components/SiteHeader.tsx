'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FileSpreadsheet, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StartExtractingButton } from '@/components/StartExtractingButton';

export function SiteHeader() {
  const pathname = usePathname();

  const navLinks = [
    { label: 'How It Works', href: '/#how-it-works' },
    { label: 'Features', href: '/#features' },
    { label: 'Why Us', href: '/#why-choose-us' },
    { label: 'FAQ', href: '/#faq' },
    { label: 'Pricing', href: '/pricing' },
  ];

  return (
    <header className="border-b border-border/40 bg-background/80 backdrop-blur-md sticky top-0 z-50 transition-all">
      <div className="container max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 font-semibold text-lg tracking-tight">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary via-purple-600 to-indigo-600 flex items-center justify-center text-primary-foreground shadow-md shadow-primary/20">
            <FileSpreadsheet className="h-4 w-4" />
          </div>
          <span className="font-semibold text-lg tracking-tight text-foreground">
            FinFlow<span className="text-primary font-bold">.AI</span>
          </span>
        </Link>

        {/* Nav Links */}
        <nav className="hidden md:flex items-center gap-7 text-[13px] font-medium text-muted-foreground">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`hover:text-foreground transition-colors ${
                pathname === link.href ? 'text-foreground' : ''
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Action CTAs */}
        <div className="flex items-center gap-2.5">
          <Link href="/login">
            <Button variant="ghost" size="sm" className="text-[13px] font-medium text-muted-foreground hover:text-foreground h-8 px-3">
              Log in
            </Button>
          </Link>
          <StartExtractingButton
            size="sm"
            className="bg-foreground text-background hover:bg-foreground/90 font-medium text-xs h-8 px-4 rounded-full shadow-sm"
          >
            <span>Get Started</span>
            <ArrowRight className="ml-1.5 h-3 w-3" />
          </StartExtractingButton>
        </div>
      </div>
    </header>
  );
}
