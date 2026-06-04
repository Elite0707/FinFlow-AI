"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Download,
  Search,
  Filter,
  MoreHorizontal,
  FileText,
  Calendar,
  RefreshCw,
  Files,
  AlertCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useFirestore } from "@/hooks/useFirestore";
import { useToast } from "@/components/ui/use-toast";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export default function HistoryPage() {
  const { processedExports = [], loading, deleteProcessedExport, stats } = useFirestore();
  const { toast } = useToast();
  
  const isFree = stats?.subscriptionTier === "Free";

  const handleDelete = async (exportId: string, storagePath: string) => {
    try {
      await deleteProcessedExport(exportId, storagePath);
      toast({
        title: "Record Deleted",
        description: "The processing record and ledger have been permanently deleted.",
      });
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: "Could not delete the record.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        {/* Header skeleton */}
        <div>
          <Skeleton className="h-9 w-56" />
          <Skeleton className="h-4 w-80 mt-2" />
        </div>

        {/* Search & filters skeleton */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Skeleton className="h-10 w-full sm:w-80" />
            <Skeleton className="h-10 w-10" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-28" />
            <Skeleton className="h-9 w-28" />
          </div>
        </div>

        {/* Table skeleton */}
        <div className="rounded-md border border-border bg-card">
          <div className="border-b border-border">
            <div className="grid grid-cols-6 p-4">
              <Skeleton className="h-4 w-8" />
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-14" />
              <Skeleton className="h-4 w-14 ml-auto" />
            </div>
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="grid grid-cols-6 p-4 border-b border-border last:border-0 items-center">
              <Skeleton className="h-3 w-16" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded" />
                <div>
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-3 w-24 mt-1" />
                </div>
              </div>
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-8 w-8 rounded ml-auto" />
            </div>
          ))}
        </div>

        <Skeleton className="h-4 w-28" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Processing History</h1>
        <p className="text-muted-foreground mt-1">View and manage your past document extractions.</p>
      </div>

      {isFree && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-amber-600 dark:text-amber-400">7-Day Ephemerality Rule Active</h4>
            <p className="text-sm text-amber-600/80 dark:text-amber-400/80 mt-1">
              On the Free tier, your history, uploaded documents, and generated ledgers are permanently deleted after 7 days.
            </p>
            <Button variant="link" className="p-0 h-auto text-sm text-amber-600 dark:text-amber-400 font-semibold mt-2">
              Upgrade to Pro for permanent ledger storage &rarr;
            </Button>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by filename, ID, or tag..." 
              className="pl-9"
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
           <Button variant="outline" size="sm">
            <Calendar className="mr-2 h-4 w-4" />
            Date Range
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export Log
          </Button>
        </div>
      </div>

      <div className="rounded-md border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">ID</TableHead>
              <TableHead>Export Name</TableHead>
              <TableHead>Template Used</TableHead>
              <TableHead>Date Generated</TableHead>
              <TableHead>Files Extracted</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {processedExports.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No processing history found. Run an extraction to generate reports.
                </TableCell>
              </TableRow>
            ) : (
              processedExports.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">{item.id.slice(0, 8)}</TableCell>
                  <TableCell>
                    <a href={item.downloadURL} download={item.fileName} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 group hover:underline decoration-emerald-500/50">
                      <FileText className="h-4 w-4 text-emerald-500 group-hover:text-emerald-600 transition-colors" />
                      <div className="flex flex-col">
                        <span className="font-medium text-sm truncate max-w-[250px] text-foreground" title={item.fileName}>{item.fileName}</span>
                        <span className="text-xs text-muted-foreground">Excel Spreadsheet</span>
                      </div>
                    </a>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-normal">{item.templateName}</Badge>
                  </TableCell>
                  <TableCell>
                    {item.createdAt?.seconds 
                      ? formatDistanceToNow(new Date(item.createdAt.seconds * 1000), { addSuffix: true }) 
                      : "Just now"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <Files className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{item.fileCount} Invoice{item.fileCount !== 1 ? 's' : ''}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30" asChild>
                        <a href={item.downloadURL} download={item.fileName} target="_blank" rel="noopener noreferrer" title="Download Ledger">
                          <Download className="h-4 w-4" />
                        </a>
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <a href={item.downloadURL} download={item.fileName} target="_blank" rel="noopener noreferrer" className="flex items-center cursor-pointer font-medium text-emerald-600 focus:text-emerald-700">
                              <Download className="mr-2 h-4 w-4" /> Download Ledger
                            </a>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive focus:bg-destructive focus:text-destructive-foreground" onClick={() => handleDelete(item.id, item.storagePath)}>
                            Delete Record
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div>Showing {processedExports.length} items</div>
      </div>
    </div>
  );
}
