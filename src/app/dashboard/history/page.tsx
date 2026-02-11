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
  RefreshCw
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function HistoryPage() {
  const history = [
    { id: "DOC-1024", name: "Invoice_Q3_Acme_Corp.pdf", type: "Invoice", template: "Standard Invoice", date: "Oct 24, 2023", status: "Completed", size: "2.4 MB" },
    { id: "DOC-1023", name: "Bank_Statement_Oct_2023.pdf", type: "Bank Statement", template: "Chase Bank", date: "Oct 24, 2023", status: "Processing", size: "4.1 MB" },
    { id: "DOC-1022", name: "Financial_Report_Q2.pdf", type: "Report", template: "Annual Report", date: "Oct 23, 2023", status: "Completed", size: "1.2 MB" },
    { id: "DOC-1021", name: "Vendor_List_2023.xlsx", type: "Vendor List", template: "Contact List", date: "Oct 23, 2023", status: "Failed", size: "0.8 MB" },
    { id: "DOC-1020", name: "Receipts_Travel_Nov.pdf", type: "Receipts", template: "Uber Receipts", date: "Oct 22, 2023", status: "Completed", size: "5.6 MB" },
    { id: "DOC-1019", name: "Invoice_Batch_001.pdf", type: "Invoice", template: "Standard Invoice", date: "Oct 21, 2023", status: "Completed", size: "8.2 MB" },
    { id: "DOC-1018", name: "Payroll_Summary.pdf", type: "Payroll", template: "Payroll ADP", date: "Oct 20, 2023", status: "Completed", size: "1.5 MB" },
  ];

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
              <TableHead>Date Processed</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {history.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-mono text-xs text-muted-foreground">{item.id}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">{item.name}</span>
                      <span className="text-xs text-muted-foreground">{item.size} • {item.type}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{item.template}</TableCell>
                <TableCell>{item.date}</TableCell>
                <TableCell>
                  {item.status === "Completed" && (
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                      Completed
                    </Badge>
                  )}
                  {item.status === "Processing" && (
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                      <RefreshCw className="mr-1 h-3 w-3 animate-spin" /> Processing
                    </Badge>
                  )}
                  {item.status === "Failed" && (
                    <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
                      Failed
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem><Download className="mr-2 h-4 w-4" /> Download Excel</DropdownMenuItem>
                      <DropdownMenuItem><Download className="mr-2 h-4 w-4" /> Download CSV</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Delete Record</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div>Showing 1-7 of 128 items</div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled>Previous</Button>
          <Button variant="outline" size="sm">Next</Button>
        </div>
      </div>
    </div>
  );
}