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
  AlertCircle
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

export default function DashboardPage() {
  const { stats, userFiles, loading } = useFirestore();
  const recentUploads = userFiles ?? [];

  if (loading) {
    return <div className="p-8 text-center">Loading dashboard...</div>;
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
            <Button disabled={!stats || stats.creditsRemaining <= 0}>
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
        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalDocumentsProcessed || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-emerald-500 font-medium">Lifetime</span> processed
            </p>
          </CardContent>
        </Card>
        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credits Remaining</CardTitle>
            <div className="h-4 w-4 text-muted-foreground">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.creditsRemaining || 0}</div>
            <div className="w-full bg-secondary h-1.5 rounded-full mt-2">
              <div 
                className="bg-primary h-full rounded-full transition-all" 
                style={{ width: `${Math.min(100, ((stats?.creditsRemaining || 0) / 1000) * 100)}%` }}
              ></div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.subscriptionTier} Plan
            </p>
          </CardContent>
        </Card>
        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Templates</CardTitle>
            <div className="h-4 w-4 text-muted-foreground">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeTemplatesCount || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Ready to use
            </p>
          </CardContent>
        </Card>
        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">99.8%</div>
            <p className="text-xs text-muted-foreground mt-1">
              System Uptime
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
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

        <Card className="md:col-span-3 lg:col-span-2">
          <CardHeader>
            <CardTitle>Processing Queue</CardTitle>
            <CardDescription>Live status of your documents.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="text-sm text-muted-foreground text-center py-4">
                Processing status will appear here once extraction is enabled.
              </div>

              <div className="mt-8 p-4 rounded-lg bg-primary/5 border border-primary/10">
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
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}