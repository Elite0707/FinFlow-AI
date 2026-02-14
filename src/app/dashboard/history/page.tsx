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

export default function HistoryPage() {
  const { userFiles: history = [], loading, deleteUserFile } = useFirestore();
  const { toast } = useToast();

  const handleDelete = async (fileId: string, storagePath: string) => {
    try {
      await deleteUserFile(fileId, storagePath);
      toast({
        title: "File Deleted",
        description: "The file has been permanently deleted.",
      });
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: "Could not delete the file.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading history...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Processing History</h1>
        <p className="text-muted-foreground mt-1">View and manage your past document extractions.</p>
      </div>

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
              <TableHead>Document Name</TableHead>
              <TableHead>Template Used</TableHead>
              <TableHead>Date Uploaded</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {history.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No processing history found.
                </TableCell>
              </TableRow>
            ) : (
              history.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">{item.id.slice(0, 8)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      <div className="flex flex-col">
                        <span className="font-medium text-sm truncate max-w-[200px]" title={item.name}>{item.name}</span>
                        <span className="text-xs text-muted-foreground">{(item.size / 1024 / 1024).toFixed(2)} MB • {item.type || "File"}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>Standard Extraction</TableCell>
                  <TableCell>
                    {item.createdAt?.seconds 
                      ? formatDistanceToNow(new Date(item.createdAt.seconds * 1000), { addSuffix: true }) 
                      : "Just now"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                      Uploaded
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <a href={item.downloadURL} target="_blank" rel="noopener noreferrer" className="flex items-center cursor-pointer">
                            <Download className="mr-2 h-4 w-4" /> Download
                          </a>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(item.id, item.storagePath)}>
                          Delete Record
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div>Showing {history.length} items</div>
      </div>
    </div>
  );
}
