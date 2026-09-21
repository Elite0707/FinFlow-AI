"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { StartExtractingButton } from "@/components/StartExtractingButton";
import {
  FileText,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Layers,
  Table,
  FileSpreadsheet,
  Download,
  UploadCloud,
  RefreshCw,
  Clock,
  Lock,
  ChevronRight,
  Star,
  Users,
  Check,
  HelpCircle,
  Send,
  Twitter,
  Linkedin,
  Github,
  Mail,
  ArrowUpRight,
  Building2,
  Sliders,
  Database,
  ChevronDown,
} from "lucide-react";

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [activeMockTab, setActiveMockTab] = useState<'INDEX' | 'ACME' | 'NEXUS' | 'ZENITH'>('INDEX');

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans selection:bg-primary/20 selection:text-primary">
      {/* 1. Header Navigation */}
      <SiteHeader />

      <main className="flex-1">
        {/* 2. Hero Section */}
        <section className="relative pt-16 pb-20 md:pt-24 md:pb-32 overflow-hidden">
          {/* Background Ambient Glows */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-primary/30 to-purple-500/20 blur-[120px] rounded-full -z-10 pointer-events-none" />
          <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-indigo-500/10 blur-[90px] rounded-full -z-10 pointer-events-none" />

          <div className="container max-w-6xl mx-auto px-4 sm:px-6 flex flex-col items-center text-center">
            {/* Announcement Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-border/70 bg-card/60 text-xs font-normal text-muted-foreground mb-8 backdrop-blur-md hover:border-border transition-colors">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-foreground font-medium">FinFlow AI v2.0</span>
              <span className="text-muted-foreground/50">—</span>
              <span>Multi-Invoice Intelligence</span>
              <ChevronRight className="h-3 w-3 text-muted-foreground/60" />
            </div>

            {/* Main Headline */}
            <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-normal tracking-[-0.03em] max-w-4xl leading-[1.12] mb-6 text-foreground">
              Streamline your financial workflows with{" "}
              <span className="italic font-normal text-muted-foreground/90">
                AI-powered precision
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed mb-10 font-normal">
              FinFlow AI automatically extracts PDF invoices, separates buyers into unique Excel tabs, and builds clean, audit-ready financial ledgers in seconds.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto mb-16">
              <StartExtractingButton className="w-full sm:w-auto text-sm px-6 h-11 bg-foreground text-background hover:bg-foreground/90 rounded-full font-medium transition-all shadow-sm" />
              <a href="#how-it-works" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto text-sm px-6 h-11 rounded-full border-border bg-card/40 hover:bg-muted/50 font-medium text-foreground">
                  See How It Works
                </Button>
              </a>
            </div>

            {/* Interactive Hero Mockup Graphic */}
            <div className="w-full max-w-5xl rounded-2xl border border-border/80 bg-card/90 shadow-2xl shadow-primary/10 overflow-hidden backdrop-blur-xl relative group">
              {/* Window Chrome Header */}
              <div className="px-4 py-3 border-b border-border/60 bg-muted/40 flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-destructive/60" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500/60" />
                  <div className="h-3 w-3 rounded-full bg-emerald-500/60" />
                  <span className="ml-2 font-mono text-[11px] text-muted-foreground/80">finflow-ledger-engine.xlsx</span>
                </div>
                <div className="flex items-center gap-2 bg-background/60 px-3 py-1 rounded-md border border-border/40 text-[11px]">
                  <Sparkles className="h-3 w-3 text-primary animate-pulse" />
                  <span>AI Extraction Active: 3 Invoices Detected</span>
                </div>
              </div>

              {/* Mockup Dashboard Content */}
              <div className="p-6 md:p-8 bg-gradient-to-b from-background/40 to-muted/20">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
                  {/* Left Panel: Source PDF */}
                  <div className="md:col-span-4 p-4 rounded-xl bg-card border border-border/60 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Source Document</span>
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[10px]">Batch_Invoices.pdf</Badge>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/30 border border-border/40 space-y-2 text-left">
                        <div className="flex items-center justify-between text-xs font-medium">
                          <span>Pages: 3</span>
                          <span className="text-emerald-400 text-[11px]">Parsed 100%</span>
                        </div>
                        <div className="space-y-1 text-[11px] text-muted-foreground">
                          <p className="flex justify-between"><span>Seller:</span> <span className="text-foreground">APEX GLOBAL ENTERPRISES</span></p>
                          <p className="flex justify-between"><span>Buyers:</span> <span className="text-primary font-semibold">3 Companies</span></p>
                        </div>
                      </div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      <span>Buyer names extracted from Bill To section</span>
                    </div>
                  </div>

                  {/* Center Conversion Arrow */}
                  <div className="md:col-span-1 flex items-center justify-center py-2 md:py-0">
                    <div className="p-3 rounded-full bg-primary/10 border border-primary/20 text-primary animate-bounce">
                      <ArrowRight className="h-5 w-5" />
                    </div>
                  </div>

                  {/* Right Panel: Auto-Generated Excel Sheet Preview */}
                  <div className="md:col-span-7 p-4 rounded-xl bg-card border border-border/60 text-left space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Generated Excel Ledger</span>
                      <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                        <FileSpreadsheet className="h-3.5 w-3.5" /> 4 Tabs Ready
                      </div>
                    </div>

                    {/* Sheet Tabs */}
                    <div className="flex items-center justify-between border-b border-border/40 pb-1.5">
                      <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
                        <button
                          type="button"
                          onClick={() => setActiveMockTab('INDEX')}
                          className={`px-3 py-1.5 rounded-md font-medium text-[11px] transition-all cursor-pointer ${
                            activeMockTab === 'INDEX'
                              ? 'bg-primary text-primary-foreground shadow-sm'
                              : 'bg-muted/40 text-muted-foreground hover:bg-muted/70 hover:text-foreground'
                          }`}
                        >
                          INDEX
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveMockTab('ACME')}
                          className={`px-3 py-1.5 rounded-md font-medium text-[11px] transition-all cursor-pointer ${
                            activeMockTab === 'ACME'
                              ? 'bg-primary text-primary-foreground shadow-sm'
                              : 'bg-muted/40 text-muted-foreground hover:bg-muted/70 hover:text-foreground'
                          }`}
                        >
                          ACME IND.
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveMockTab('NEXUS')}
                          className={`px-3 py-1.5 rounded-md font-medium text-[11px] transition-all cursor-pointer ${
                            activeMockTab === 'NEXUS'
                              ? 'bg-primary text-primary-foreground shadow-sm'
                              : 'bg-muted/40 text-muted-foreground hover:bg-muted/70 hover:text-foreground'
                          }`}
                        >
                          NEXUS LOGISTICS
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveMockTab('ZENITH')}
                          className={`px-3 py-1.5 rounded-md font-medium text-[11px] transition-all cursor-pointer ${
                            activeMockTab === 'ZENITH'
                              ? 'bg-primary text-primary-foreground shadow-sm'
                              : 'bg-muted/40 text-muted-foreground hover:bg-muted/70 hover:text-foreground'
                          }`}
                        >
                          ZENITH PHARMA
                        </button>
                      </div>
                      <span className="hidden sm:inline-block text-[10px] text-muted-foreground/70 font-mono">
                        Click tabs to preview ↗
                      </span>
                    </div>

                    {/* Table Rows Preview */}
                    <div className="border rounded-lg overflow-hidden border-border/40 text-xs bg-background/60 min-h-[140px] flex flex-col justify-between">
                      {activeMockTab === 'INDEX' && (
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-muted/50 border-b border-border/40 text-[11px] text-muted-foreground font-semibold">
                              <th className="p-2.5">SR NO</th>
                              <th className="p-2.5">BUYER COMPANY NAME</th>
                              <th className="p-2.5">GSTIN</th>
                              <th className="p-2.5 text-right">PAGE</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/30 text-[11px]">
                            <tr className="hover:bg-muted/20 transition-colors cursor-pointer" onClick={() => setActiveMockTab('ACME')}>
                              <td className="p-2.5 font-mono text-muted-foreground">1</td>
                              <td className="p-2.5 font-medium text-foreground">ACME INDUSTRIES PVT. LTD.</td>
                              <td className="p-2.5 font-mono text-muted-foreground text-[10px]">27AABCA1234F1Z5</td>
                              <td className="p-2.5 text-right font-mono text-primary font-medium">Page 1</td>
                            </tr>
                            <tr className="hover:bg-muted/20 transition-colors cursor-pointer" onClick={() => setActiveMockTab('NEXUS')}>
                              <td className="p-2.5 font-mono text-muted-foreground">2</td>
                              <td className="p-2.5 font-medium text-foreground">NEXUS LOGISTICS CORP</td>
                              <td className="p-2.5 font-mono text-muted-foreground text-[10px]">29AAACN5678K1Z2</td>
                              <td className="p-2.5 text-right font-mono text-primary font-medium">Page 2</td>
                            </tr>
                            <tr className="hover:bg-muted/20 transition-colors cursor-pointer" onClick={() => setActiveMockTab('ZENITH')}>
                              <td className="p-2.5 font-mono text-muted-foreground">3</td>
                              <td className="p-2.5 font-medium text-foreground">ZENITH PHARMA SOLUTIONS</td>
                              <td className="p-2.5 font-mono text-muted-foreground text-[10px]">33AAACZ9012L1Z9</td>
                              <td className="p-2.5 text-right font-mono text-primary font-medium">Page 3</td>
                            </tr>
                          </tbody>
                        </table>
                      )}

                      {activeMockTab === 'ACME' && (
                        <div>
                          <div className="px-3 py-1.5 bg-muted/30 border-b border-border/30 flex items-center justify-between text-[10px] text-muted-foreground font-mono">
                            <span>BUYER: <strong className="text-foreground font-sans">ACME INDUSTRIES PVT. LTD.</strong></span>
                            <span>GSTIN: <strong className="text-foreground">27AABCA1234F1Z5</strong></span>
                          </div>
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-muted/50 border-b border-border/40 text-[11px] text-muted-foreground font-semibold">
                                <th className="p-2.5">INVOICE NO</th>
                                <th className="p-2.5">DATE</th>
                                <th className="p-2.5">ITEM / SERVICE</th>
                                <th className="p-2.5 text-right">TOTAL (INR)</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border/30 text-[11px]">
                              <tr>
                                <td className="p-2.5 font-mono font-medium text-primary">INV-2026-0842</td>
                                <td className="p-2.5 font-mono text-muted-foreground">12-Sep-2026</td>
                                <td className="p-2.5 text-foreground">Industrial Cloud Hosting & API</td>
                                <td className="p-2.5 text-right font-mono font-semibold text-emerald-400">₹1,71,100</td>
                              </tr>
                              <tr>
                                <td className="p-2.5 font-mono font-medium text-primary">INV-2026-0843</td>
                                <td className="p-2.5 font-mono text-muted-foreground">15-Sep-2026</td>
                                <td className="p-2.5 text-foreground">Enterprise Security Suite</td>
                                <td className="p-2.5 text-right font-mono font-semibold text-emerald-400">₹97,350</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      )}

                      {activeMockTab === 'NEXUS' && (
                        <div>
                          <div className="px-3 py-1.5 bg-muted/30 border-b border-border/30 flex items-center justify-between text-[10px] text-muted-foreground font-mono">
                            <span>BUYER: <strong className="text-foreground font-sans">NEXUS LOGISTICS CORP</strong></span>
                            <span>GSTIN: <strong className="text-foreground">29AAACN5678K1Z2</strong></span>
                          </div>
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-muted/50 border-b border-border/40 text-[11px] text-muted-foreground font-semibold">
                                <th className="p-2.5">INVOICE NO</th>
                                <th className="p-2.5">DATE</th>
                                <th className="p-2.5">ITEM / SERVICE</th>
                                <th className="p-2.5 text-right">TOTAL (INR)</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border/30 text-[11px]">
                              <tr>
                                <td className="p-2.5 font-mono font-medium text-primary">INV-2026-0911</td>
                                <td className="p-2.5 font-mono text-muted-foreground">18-Sep-2026</td>
                                <td className="p-2.5 text-foreground">Fleet Telematics & Route Engine</td>
                                <td className="p-2.5 text-right font-mono font-semibold text-emerald-400">₹2,71,400</td>
                              </tr>
                              <tr>
                                <td className="p-2.5 font-mono font-medium text-primary">INV-2026-0915</td>
                                <td className="p-2.5 font-mono text-muted-foreground">20-Sep-2026</td>
                                <td className="p-2.5 text-foreground">Warehouse Automation Addon</td>
                                <td className="p-2.5 text-right font-mono font-semibold text-emerald-400">₹75,520</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      )}

                      {activeMockTab === 'ZENITH' && (
                        <div>
                          <div className="px-3 py-1.5 bg-muted/30 border-b border-border/30 flex items-center justify-between text-[10px] text-muted-foreground font-mono">
                            <span>BUYER: <strong className="text-foreground font-sans">ZENITH PHARMA SOLUTIONS</strong></span>
                            <span>GSTIN: <strong className="text-foreground">33AAACZ9012L1Z9</strong></span>
                          </div>
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-muted/50 border-b border-border/40 text-[11px] text-muted-foreground font-semibold">
                                <th className="p-2.5">INVOICE NO</th>
                                <th className="p-2.5">DATE</th>
                                <th className="p-2.5">ITEM / SERVICE</th>
                                <th className="p-2.5 text-right">TOTAL (INR)</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border/30 text-[11px]">
                              <tr>
                                <td className="p-2.5 font-mono font-medium text-primary">INV-2026-1004</td>
                                <td className="p-2.5 font-mono text-muted-foreground">14-Sep-2026</td>
                                <td className="p-2.5 text-foreground">Cold-Chain Compliance Sensor Pack</td>
                                <td className="p-2.5 text-right font-mono font-semibold text-emerald-400">₹3,71,700</td>
                              </tr>
                              <tr>
                                <td className="p-2.5 font-mono font-medium text-primary">INV-2026-1008</td>
                                <td className="p-2.5 font-mono text-muted-foreground">19-Sep-2026</td>
                                <td className="p-2.5 text-foreground">Batch Verification AI Node</td>
                                <td className="p-2.5 text-right font-mono font-semibold text-emerald-400">₹1,41,600</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2.5 How It Works Section */}
        <section id="how-it-works" className="py-20 md:py-28 border-t border-border/40 scroll-mt-16 relative">
          <div className="container max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium">
                <Zap className="h-3.5 w-3.5" />
                <span>Simple 3-Step Process</span>
              </div>
              <h2 className="font-serif text-3xl sm:text-5xl font-normal tracking-[-0.02em] text-foreground">
                How FinFlow AI works
              </h2>
              <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto font-normal">
                From messy invoices to structured, audit-ready financial ledgers in seconds.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
              {/* Step 1: Upload */}
              <div className="rounded-2xl border border-border/60 bg-card/60 p-6 sm:p-8 flex flex-col justify-between hover:border-primary/40 transition-all group relative">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-medium text-muted-foreground/70 bg-muted/60 px-2.5 py-1 rounded-md border border-border/40">
                      STEP 01
                    </span>
                    <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                      <UploadCloud className="h-5 w-5" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">Upload</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-normal">
                      Drop single or batch GST/tax invoices (PDF/Scanned).
                    </p>
                  </div>
                </div>

                {/* Visual Preview */}
                <div className="mt-6 pt-4 border-t border-border/40">
                  <div className="p-3 rounded-xl bg-background/60 border border-border/50 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center font-bold text-[10px]">
                        PDF
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-[11px]">invoices_batch.pdf</p>
                        <p className="text-[10px] text-muted-foreground">Up to 50 files / batch</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">
                      Ready
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Step 2: Extract */}
              <div className="rounded-2xl border border-border/60 bg-card/60 p-6 sm:p-8 flex flex-col justify-between hover:border-primary/40 transition-all group relative">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-md border border-primary/20">
                      STEP 02
                    </span>
                    <div className="h-9 w-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Sparkles className="h-5 w-5" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">Extract</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-normal">
                      Gemini 2.5 Flash normalizes line items and validates GSTIN numbers in seconds.
                    </p>
                  </div>
                </div>

                {/* Visual Preview */}
                <div className="mt-6 pt-4 border-t border-border/40">
                  <div className="p-3 rounded-xl bg-background/60 border border-border/50 space-y-1.5 text-[11px]">
                    <div className="flex items-center justify-between text-emerald-400">
                      <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5" /> GSTIN Validated</span>
                      <span className="font-mono text-[10px]">99.8% ACC</span>
                    </div>
                    <div className="flex items-center justify-between text-muted-foreground text-[10px]">
                      <span>Model: Gemini 2.5 Flash</span>
                      <span>0.8s / page</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3: Export */}
              <div className="rounded-2xl border border-border/60 bg-card/60 p-6 sm:p-8 flex flex-col justify-between hover:border-primary/40 transition-all group relative">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-medium text-muted-foreground/70 bg-muted/60 px-2.5 py-1 rounded-md border border-border/40">
                      STEP 03
                    </span>
                    <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <FileSpreadsheet className="h-5 w-5" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">Export</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-normal">
                      Download an audit-ready, multi-tab Excel ledger.
                    </p>
                  </div>
                </div>

                {/* Visual Preview */}
                <div className="mt-6 pt-4 border-t border-border/40">
                  <div className="p-3 rounded-xl bg-background/60 border border-border/50 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-[10px]">
                        XLSX
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-[11px]">Audit_Ledger.xlsx</p>
                        <p className="text-[10px] text-muted-foreground">Index + Buyer Tabs</p>
                      </div>
                    </div>
                    <div className="p-1 rounded bg-muted text-foreground">
                      <Download className="h-3.5 w-3.5" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Features Bento Grid Section */}
        <section id="features" className="py-20 md:py-28 bg-muted/20 border-y border-border/40 relative">
          <div className="container max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium">
                <Layers className="h-3.5 w-3.5" />
                <span>Smart Features</span>
              </div>
              <h2 className="font-serif text-3xl sm:text-5xl font-normal tracking-[-0.02em] text-foreground">
                Smart features to supercharge your workflow
              </h2>
              <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto font-normal">
                FinFlow AI empowers your finance team with intelligent tools to extract, group, and process financial documents in one seamless platform.
              </p>
            </div>

            {/* Bento Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Card 1: AI Data Extraction */}
              <div className="md:col-span-7 rounded-2xl border border-border/60 bg-card p-6 md:p-8 flex flex-col justify-between hover:border-primary/50 transition-all shadow-sm">
                <div className="space-y-4 mb-6">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <h3 className="text-2xl font-bold">AI Invoice Data Extraction</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Extract invoice number, date, buyer name, tax amounts, and line items with 99.8% precision. Powered by advanced Gemini AI tailored for financial documents.
                  </p>
                </div>
                {/* Visual Chip Preview */}
                <div className="p-4 rounded-xl bg-muted/40 border border-border/40 flex flex-wrap gap-2 text-xs">
                  <span className="px-3 py-1 rounded-md bg-background border border-border/60 font-medium">Invoice Date</span>
                  <span className="px-3 py-1 rounded-md bg-background border border-border/60 font-medium">Invoice Number</span>
                  <span className="px-3 py-1 rounded-md bg-primary/10 text-primary border border-primary/20 font-semibold">__party_name (Buyer)</span>
                  <span className="px-3 py-1 rounded-md bg-background border border-border/60 font-medium">Taxable Value</span>
                  <span className="px-3 py-1 rounded-md bg-background border border-border/60 font-medium">Grand Total</span>
                </div>
              </div>

              {/* Card 2: Automatic Buyer-Wise Ledger Hub */}
              <div className="md:col-span-5 rounded-2xl border border-border/60 bg-card p-6 md:p-8 flex flex-col justify-between hover:border-primary/50 transition-all shadow-sm">
                <div className="space-y-4 mb-6">
                  <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <h3 className="text-2xl font-bold">Automatic Buyer-Wise Ledger Hub</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Upload 50+ invoices at once. FinFlow AI identifies unique buyers, generates an Index sheet, and segregates data into dedicated company tabs.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-muted/40 border border-border/40 space-y-2 text-xs">
                  <div className="flex items-center justify-between font-medium">
                    <span>Index Sheet</span>
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">Auto-Generated</Badge>
                  </div>
                  <div className="space-y-1 text-muted-foreground text-[11px]">
                    <div className="p-1.5 rounded bg-background border border-border/30 flex justify-between">
                      <span>Sheet 1: Company A</span> <span className="font-mono">10 Invoices</span>
                    </div>
                    <div className="p-1.5 rounded bg-background border border-border/30 flex justify-between">
                      <span>Sheet 2: Company B</span> <span className="font-mono">15 Invoices</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 3: Multi-Page PDF Invoice Splitter */}
              <div className="md:col-span-4 rounded-2xl border border-border/60 bg-card p-6 flex flex-col justify-between hover:border-primary/50 transition-all shadow-sm">
                <div className="space-y-3 mb-4">
                  <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                    <FileText className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl font-bold">Multi-Invoice PDF Parsing</h3>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    Parse 3-page PDFs containing 3 different invoices seamlessly. Tier-based page limits ensure cost-effective processing.
                  </p>
                </div>
                <div className="text-xs text-primary font-semibold flex items-center gap-1 pt-2">
                  Learn about page limits <ArrowUpRight className="h-3.5 w-3.5" />
                </div>
              </div>

              {/* Card 4: Custom Extraction Template Engine */}
              <div className="md:col-span-4 rounded-2xl border border-border/60 bg-card p-6 flex flex-col justify-between hover:border-primary/50 transition-all shadow-sm">
                <div className="space-y-3 mb-4">
                  <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                    <Sliders className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl font-bold">Custom Template Engine</h3>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    Pick pre-defined templates or create custom extraction schemas to match your exact accounting software format.
                  </p>
                </div>
                <div className="text-xs text-primary font-semibold flex items-center gap-1 pt-2">
                  Explore Template Builder <ArrowUpRight className="h-3.5 w-3.5" />
                </div>
              </div>

              {/* Card 5: Tiered Ephemeral Data Retention */}
              <div className="md:col-span-4 rounded-2xl border border-border/60 bg-card p-6 flex flex-col justify-between hover:border-primary/50 transition-all shadow-sm">
                <div className="space-y-3 mb-4">
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl font-bold">Tiered Data Ephemerality</h3>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    Automatic data cleanup policies: Free (7 days), Starter (90 days), Business (3 years), Enterprise (Permanent ledgers).
                  </p>
                </div>
                <div className="text-xs text-primary font-semibold flex items-center gap-1 pt-2">
                  View Security Policy <ArrowUpRight className="h-3.5 w-3.5" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Why Choose Us Section */}
        <section id="why-choose-us" className="py-20 md:py-28">
          <div className="container max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Why Choose Us</span>
              </div>
              <h2 className="font-serif text-3xl sm:text-5xl font-normal tracking-[-0.02em] text-foreground">
                Why teams choose FinFlow AI
              </h2>
              <p className="text-muted-foreground text-base sm:text-lg font-normal">
                Built for modern finance teams seeking speed, accuracy, and operational clarity.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: Zap,
                  title: "Reduce Manual Workload",
                  desc: "FinFlow AI eliminates manual data entry from PDF invoices, saving up to 80% of processing time.",
                },
                {
                  icon: Building2,
                  title: "Buyer-First Customer Grouping",
                  desc: "Extracts the exact buyer/customer company from 'Bill To' sections rather than generic document sellers.",
                },
                {
                  icon: FileSpreadsheet,
                  title: "Production Excel Output",
                  desc: "Download ready-to-use Excel workbooks with clean Index sheets and pre-filtered buyer tabs.",
                },
                {
                  icon: Database,
                  title: "Transparent Credit System",
                  desc: "1 credit covers up to 5 pages. Failed document processing is automatically refunded instantly.",
                },
                {
                  icon: Lock,
                  title: "Enterprise Security & Ephemerality",
                  desc: "Bank-grade encryption with tier-based automated file retention policies for total privacy.",
                },
                {
                  icon: RefreshCw,
                  title: "Instant Batch Processing",
                  desc: "Upload batches of up to 50 documents simultaneously and monitor live progress in your dashboard queue.",
                },
              ].map((item, idx) => (
                <div key={idx} className="p-6 rounded-2xl border border-border/60 bg-card hover:border-primary/50 transition-all space-y-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">{item.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 5. Testimonials Grid Section */}
        <section id="testimonials" className="py-20 md:py-28 bg-muted/20 border-y border-border/40">
          <div className="container max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium">
                <Star className="h-3.5 w-3.5 fill-primary" />
                <span>Testimonials</span>
              </div>
              <h2 className="font-serif text-3xl sm:text-5xl font-normal tracking-[-0.02em] text-foreground">
                Loved by productive financial teams
              </h2>
              <p className="text-muted-foreground text-base sm:text-lg font-normal">
                See how accounting agencies, CFOs, and finance leaders save 15+ hours every week.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  quote: "FinFlow AI handles multi-invoice PDFs effortlessly. The buyer-wise Excel tabs save us hours during monthly GST filing.",
                  author: "CA Rajesh Sharma",
                  role: "Senior Tax Consultant, Apex Advisors",
                  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&q=80",
                },
                {
                  quote: "The ability to define custom extraction templates and get structured Excel files with an Index tab is game-changing.",
                  author: "Priya Mehta",
                  role: "Finance Operations Manager, Zenith Corp",
                  avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&q=80",
                },
                {
                  quote: "We process hundreds of vendor bills monthly. Automatic buyer extraction and instant error refunds make it indispensable.",
                  author: "Vikram Patel",
                  role: "Head of Accounting, KwikLogistics",
                  avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&q=80",
                },
                {
                  quote: "Data retention policies for Free and Paid tiers give our corporate clients complete confidence in data privacy.",
                  author: "Ananya Deshmukh",
                  role: "Chief Financial Officer, Horizon Tech",
                  avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&q=80",
                },
                {
                  quote: "No more manually fixing seller vs buyer names. The AI prompt accurately pulls the buyer from 'Bill To' every time.",
                  author: "Siddharth Verma",
                  role: "Audit Lead, Deloitte Partner Network",
                  avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&q=80",
                },
                {
                  quote: "The live processing queue with failure details modal ensures we always know why a document failed and get refunded.",
                  author: "Meera Nair",
                  role: "Accounts Payable Supervisor, Omnia Global",
                  avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&q=80",
                },
              ].map((item, idx) => (
                <Card key={idx} className="bg-card border-border/60 p-6 flex flex-col justify-between hover:border-primary/50 transition-all">
                  <div className="space-y-4">
                    <div className="flex text-amber-400 gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-amber-400" />
                      ))}
                    </div>
                    <p className="text-xs text-foreground/90 leading-relaxed italic">"{item.quote}"</p>
                  </div>
                  <div className="flex items-center gap-3 pt-6 border-t border-border/40 mt-4">
                    <img src={item.avatar} alt={item.author} className="h-9 w-9 rounded-full object-cover border border-border" />
                    <div>
                      <h4 className="text-xs font-bold text-foreground">{item.author}</h4>
                      <p className="text-[11px] text-muted-foreground">{item.role}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* 6. FAQ Section */}
        <section id="faq" className="py-20 md:py-28">
          <div className="container max-w-4xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium">
                <HelpCircle className="h-3.5 w-3.5" />
                <span>FAQ</span>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl font-normal tracking-[-0.02em] text-foreground">
                Frequently asked questions
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base font-normal">
                Got questions? We&apos;ve got answers.
              </p>
            </div>

            <div className="space-y-4">
              {[
                {
                  q: "How does FinFlow AI group invoices into separate Excel tabs?",
                  a: "FinFlow AI extracts the customer/buyer name from the 'Bill To' or 'Receiver' section of each document (`__party_name`). It creates an Index tab listing all buyer names, followed by dedicated Excel tabs for each unique company.",
                },
                {
                  q: "What happens if a PDF contains multiple invoices?",
                  a: "FinFlow AI parses multi-page documents (up to 1 page for Free tier, 5 pages for Pro/Business tier) and extracts each invoice into separate result rows automatically.",
                },
                {
                  q: "What file formats are supported?",
                  a: "FinFlow AI supports PDF, PNG, JPG, JPEG, and WEBP formats. If an unsupported format (like .xlsx) is uploaded, the system displays a clear error and refunds your credits.",
                },
                {
                  q: "How does the credit and refund policy work?",
                  a: "1 credit covers processing up to 5 pages. If an extraction fails due to a corrupted file or unsupported format, credits for that file are automatically refunded to your account.",
                },
                {
                  q: "How long are uploaded files stored?",
                  a: "Uploaded files follow strict tier-based ephemerality: Free tier files are deleted after 7 days, Starter tier after 90 days, and Business tier after 3 years. Generated ledgers are kept permanently for paid accounts.",
                },
              ].map((item, idx) => (
                <div key={idx} className="rounded-xl border border-border/60 bg-card overflow-hidden">
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-4 text-left font-semibold text-sm flex items-center justify-between gap-4 hover:bg-muted/30 transition-colors"
                  >
                    <span>{item.q}</span>
                    <ChevronDown className={`h-4 w-4 transition-transform duration-200 text-muted-foreground ${openFaq === idx ? "rotate-180" : ""}`} />
                  </button>
                  {openFaq === idx && (
                    <div className="px-4 pb-4 text-xs text-muted-foreground leading-relaxed border-t border-border/30 pt-3">
                      {item.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 7. Call To Action Banner */}
        <section className="py-16 md:py-24 relative overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[280px] bg-gradient-to-tr from-primary/15 via-purple-500/10 to-indigo-500/5 blur-[120px] rounded-full -z-10 pointer-events-none" />

          <div className="container max-w-5xl mx-auto px-4 sm:px-6">
            <div className="rounded-3xl border border-border/80 bg-card/80 p-8 sm:p-14 text-center shadow-2xl shadow-primary/5 backdrop-blur-xl relative overflow-hidden">
              <div className="max-w-2xl mx-auto space-y-6 relative z-10">
                <h2 className="font-serif text-3xl sm:text-5xl font-normal tracking-[-0.02em] text-foreground">
                  Ready to automate your financial workflows?
                </h2>
                <p className="text-muted-foreground text-sm sm:text-base leading-relaxed font-normal max-w-lg mx-auto">
                  Join thousands of financial professionals automating document processing with AI accuracy.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <StartExtractingButton className="w-full sm:w-auto bg-foreground text-background hover:bg-foreground/90 px-6 h-11 rounded-full font-medium shadow-sm text-sm" />
                  <Link href="/pricing" className="w-full sm:w-auto">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto border-border bg-card/40 text-foreground hover:bg-muted/50 px-6 h-11 rounded-full font-medium text-sm">
                      Explore Pricing
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 8. Footer */}
      <SiteFooter />
    </div>
  );
}
