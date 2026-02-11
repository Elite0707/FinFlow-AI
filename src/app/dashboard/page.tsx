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

export default function DashboardPage() {
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
          <Button variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            New Template
          </Button>
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
            <div className="text-2xl font-bold">1,284</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-emerald-500 font-medium">+12%</span> from last month
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
            <div className="text-2xl font-bold">850</div>
            <div className="w-full bg-secondary h-1.5 rounded-full mt-2">
              <div className="bg-primary h-full rounded-full" style={{ width: '85%' }}></div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Renews in 12 days</p>
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
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground mt-1">
              3 created this week
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
              Based on last 100 uploads
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
                <CardDescription>Documents processed in the last 24 hours.</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="gap-1">
                View All <ArrowUpRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Invoice_Q3_Acme_Corp.pdf", status: "Completed", date: "2 mins ago", type: "Invoice", size: "2.4 MB" },
                { name: "Bank_Statement_Oct_2023.pdf", status: "Processing", date: "5 mins ago", type: "Bank Statement", size: "4.1 MB" },
                { name: "Financial_Report_Q2.pdf", status: "Completed", date: "1 hour ago", type: "Report", size: "1.2 MB" },
                { name: "Vendor_List_2023.xlsx", status: "Failed", date: "3 hours ago", type: "Vendor List", size: "0.8 MB" },
                { name: "Receipts_Travel_Nov.pdf", status: "Completed", date: "5 hours ago", type: "Receipts", size: "5.6 MB" },
              ].map((file, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-muted/40 hover:bg-muted/60 transition-colors border border-transparent hover:border-border">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-background border border-border flex items-center justify-center">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">{file.name}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2">
                        <span>{file.type}</span>
                        <span className="h-1 w-1 bg-muted-foreground/30 rounded-full"></span>
                        <span>{file.size}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="hidden sm:flex items-center gap-2">
                      {file.status === "Completed" && <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20">Completed</Badge>}
                      {file.status === "Processing" && <Badge variant="secondary" className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-500/20 flex gap-1"><span className="animate-pulse">●</span> Processing</Badge>}
                      {file.status === "Failed" && <Badge variant="secondary" className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20">Failed</Badge>}
                      <span className="text-xs text-muted-foreground w-20 text-right">{file.date}</span>
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
              ))}
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
              <div className="relative pl-6 border-l border-border/50 pb-6 last:pb-0">
                <span className="absolute -left-1.5 top-1 h-3 w-3 rounded-full bg-primary ring-4 ring-background"></span>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium">OCR Scanning</p>
                    <p className="text-xs text-muted-foreground">Bank_Statement_Oct_2023.pdf</p>
                  </div>
                  <span className="text-xs font-medium text-primary">85%</span>
                </div>
                <div className="h-1.5 w-full bg-secondary rounded-full mt-3">
                  <div className="h-full bg-primary rounded-full animate-pulse" style={{ width: '85%' }}></div>
                </div>
              </div>

              <div className="relative pl-6 border-l border-border/50 pb-6 last:pb-0">
                <span className="absolute -left-1.5 top-1 h-3 w-3 rounded-full bg-muted-foreground/30 ring-4 ring-background"></span>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Queued</p>
                    <p className="text-xs text-muted-foreground">Invoice_Batch_002.pdf</p>
                  </div>
                  <Clock className="h-3 w-3 text-muted-foreground" />
                </div>
              </div>

              <div className="relative pl-6 border-l border-border/50">
                <span className="absolute -left-1.5 top-1 h-3 w-3 rounded-full bg-muted-foreground/30 ring-4 ring-background"></span>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Queued</p>
                    <p className="text-xs text-muted-foreground">Q3_Financials.xlsx</p>
                  </div>
                  <Clock className="h-3 w-3 text-muted-foreground" />
                </div>
              </div>
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}