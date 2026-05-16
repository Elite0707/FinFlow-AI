"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Upload,
  Plus,
  ArrowUpRight,
  MoreHorizontal,
  CheckCircle2,
  Clock,
  AlertCircle,
  Layers,
  Zap,
  Loader2,
  Lock,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useFirestore } from "@/hooks/useFirestore";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const { stats, usage, userFiles, templates, batchJobs, loading } = useFirestore();
  const recentUploads = userFiles ?? [];

  // Compute real stats from batchJobs
  const totalDocumentsProcessed = batchJobs.reduce((sum, job) => sum + (job.completedFiles || 0), 0);
  const activeTemplatesCount = templates.filter(t => !t.isDraft).length;
  const processingJobs = batchJobs.filter(j => j.status === "processing");
  const completedJobs = batchJobs.filter(j => j.status === "completed");

  // Compute real success rate from batch results
  const allResults = batchJobs.flatMap(j => j.results || []);
  const successCount = allResults.filter(r => r.status === "Success").length;
  const successRate = allResults.length > 0
    ? Math.round((successCount / allResults.length) * 100)
    : 0;

  // Free tier info — simple 10 invoices/month
  const isFree = stats?.subscriptionTier === "Free";
  const invoiceCount = usage?.monthlyUploadCount || 0;
  const invoicesRemaining = Math.max(0, 10 - invoiceCount);

  if (loading) {
    return (
      <div className="space-y-8">
        {/* Header skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Skeleton className="h-9 w-48" />
            <Skeleton className="h-4 w-72 mt-2" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-10 w-36" />
          </div>
        </div>

        {/* Stats Grid skeleton */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-4 rounded" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mt-1" />
                <Skeleton className="h-3 w-24 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Activity skeleton */}
        <div className="grid md:grid-cols-7 gap-8">
          <Card className="md:col-span-4 lg:col-span-5">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <Skeleton className="h-6 w-36" />
                  <Skeleton className="h-4 w-52 mt-1" />
                </div>
                <Skeleton className="h-8 w-20" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-muted/40">
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-10 w-10 rounded-lg" />
                      <div>
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-3 w-28 mt-1.5" />
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-5 w-16 rounded-full" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-3 lg:col-span-2">
            <CardHeader>
              <Skeleton className="h-6 w-36" />
              <Skeleton className="h-4 w-48 mt-1" />
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <Skeleton className="h-20 w-full rounded-lg" />
                <Skeleton className="h-28 w-full rounded-lg" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of your extraction activities and usage.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/upload">
            <Button>
              <Upload className="mr-2 h-4 w-4" />
              Upload Document
            </Button>
          </Link>
          <Link href="/dashboard/templates/builder">
            <Button variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              New Template
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Documents Processed */}
        <Card className={`relative overflow-hidden transition-colors ${isFree ? 'opacity-60' : 'hover:border-primary/50'}`}>
          {isFree && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/80 backdrop-blur-[2px]">
              <Lock className="h-8 w-8 text-muted-foreground/50 mb-2" />
              <Badge variant="outline" className="text-xs">Pro</Badge>
            </div>
          )}
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documents Processed</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDocumentsProcessed}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-emerald-500 font-medium">
                {completedJobs.length} batch{completedJobs.length !== 1 ? "es" : ""}
              </span>{" "}
              completed
            </p>
          </CardContent>
        </Card>

        {/* Invoices This Month */}
        <Card className={`relative overflow-hidden transition-colors ${isFree ? 'opacity-60' : 'hover:border-primary/50'}`}>
          {isFree && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/80 backdrop-blur-[2px]">
              <Lock className="h-8 w-8 text-muted-foreground/50 mb-2" />
              <Badge variant="outline" className="text-xs">Pro</Badge>
            </div>
          )}
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Invoices This Month</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {invoiceCount} <span className="text-sm font-normal text-muted-foreground">/ 10</span>
            </div>
            <div className="w-full bg-secondary h-1.5 rounded-full mt-2">
              <div
                className={`h-full rounded-full transition-all ${invoiceCount >= 10 ? "bg-destructive" : invoiceCount >= 8 ? "bg-yellow-500" : "bg-primary"}`}
                style={{ width: `${Math.min(100, (invoiceCount / 10) * 100)}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {invoicesRemaining > 0 ? `${invoicesRemaining} remaining` : "Limit reached"} · Free Plan
            </p>
          </CardContent>
        </Card>

        {/* Active Templates */}
        <Card className={`relative overflow-hidden transition-colors ${isFree ? 'opacity-60' : 'hover:border-primary/50'}`}>
          {isFree && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/80 backdrop-blur-[2px]">
              <Lock className="h-8 w-8 text-muted-foreground/50 mb-2" />
              <Badge variant="outline" className="text-xs">Pro</Badge>
            </div>
          )}
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Templates</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeTemplatesCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {templates.filter(t => t.isDraft).length > 0 && (
                <span className="text-yellow-500 font-medium">
                  +{templates.filter(t => t.isDraft).length} draft{templates.filter(t => t.isDraft).length !== 1 ? "s" : ""}
                </span>
              )}
              {templates.filter(t => t.isDraft).length === 0 && "Ready to use"}
            </p>
          </CardContent>
        </Card>

        {/* Success Rate */}
        <Card className={`relative overflow-hidden transition-colors ${isFree ? 'opacity-60' : 'hover:border-primary/50'}`}>
          {isFree && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/80 backdrop-blur-[2px]">
              <Lock className="h-8 w-8 text-muted-foreground/50 mb-2" />
              <Badge variant="outline" className="text-xs">Pro</Badge>
            </div>
          )}
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {allResults.length > 0 ? `${successRate}%` : "—"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {allResults.length > 0
                ? `${successCount} of ${allResults.length} files`
                : "No extractions yet"
              }
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity + Processing Queue */}
      <div className="grid md:grid-cols-7 gap-8">
        <Card className="md:col-span-4 lg:col-span-5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Uploads</CardTitle>
                <CardDescription>Documents processed recently.</CardDescription>
              </div>
              <Link href="/dashboard/history">
                <Button variant="ghost" size="sm" className="gap-1">
                  View All <ArrowUpRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentUploads.slice(0, 5).length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No recent uploads</div>
              ) : (
                recentUploads.slice(0, 5).map((file, i) => (
                  <div key={file.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/40 hover:bg-muted/60 transition-colors border border-transparent hover:border-border">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-background border border-border flex items-center justify-center">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">{file.name}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-2">
                          <span>{file.type?.split("/").pop() || "Document"}</span>
                          <span className="h-1 w-1 bg-muted-foreground/30 rounded-full"></span>
                          <span>{typeof file.size === "number" ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : "Unknown size"}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="hidden sm:flex items-center gap-2">
                        <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20">
                          Uploaded
                        </Badge>
                        <span className="text-xs text-muted-foreground w-20 text-right">
                          {file.createdAt?.seconds ? formatDistanceToNow(new Date(file.createdAt.seconds * 1000), { addSuffix: true }) : "Just now"}
                        </span>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>Download Excel</DropdownMenuItem>
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Live Processing Queue */}
        <Card className="md:col-span-3 lg:col-span-2">
          <CardHeader>
            <CardTitle>Processing Queue</CardTitle>
            <CardDescription>Live status of your batch jobs.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {batchJobs.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-4">
                  No batch jobs yet. Use a template to start processing.
                </div>
              ) : (
                batchJobs.slice(0, 5).map((job) => {
                  const progress = job.totalFiles > 0
                    ? Math.round((job.completedFiles / job.totalFiles) * 100)
                    : 0;

                  return (
                    <div key={job.id} className="p-3 rounded-lg bg-muted/40 border border-transparent hover:border-border transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium truncate max-w-[140px]">
                          {job.templateName}
                        </span>
                        {job.status === "processing" ? (
                          <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20 gap-1">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Processing
                          </Badge>
                        ) : job.status === "completed" ? (
                          <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Done
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="gap-1">
                            <AlertCircle className="h-3 w-3" />
                            Failed
                          </Badge>
                        )}
                      </div>

                      {/* Progress bar */}
                      <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ease-out ${
                            job.status === "completed" ? "bg-emerald-500" :
                            job.status === "failed" ? "bg-destructive" : "bg-primary"
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-xs text-muted-foreground">
                          {job.completedFiles} / {job.totalFiles} files
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {job.createdAt?.seconds
                            ? formatDistanceToNow(new Date(job.createdAt.seconds * 1000), { addSuffix: true })
                            : "Just now"
                          }
                        </span>
                      </div>
                    </div>
                  );
                })
              )}

              {/* Tip card */}
              {batchJobs.length === 0 && (
                <div className="mt-4 p-4 rounded-lg bg-primary/5 border border-primary/10">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-primary">Tip: Use Templates</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Save time by creating templates for recurring document layouts.
                      </p>
                      <Link href="/dashboard/templates/builder">
                        <Button variant="link" className="text-primary p-0 h-auto text-xs mt-2">
                          Create Template &rarr;
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}