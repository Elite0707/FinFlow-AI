import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, MoreHorizontal, FileSpreadsheet, Copy, Trash, Edit, Share2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function TemplatesPage() {
  const templates = [
    { id: 1, name: "Standard Invoice", type: "Invoice", fields: 12, lastUsed: "2 days ago", color: "bg-blue-500" },
    { id: 2, name: "Chase Bank Statement", type: "Bank Statement", fields: 8, lastUsed: "5 hours ago", color: "bg-emerald-500" },
    { id: 3, name: "Uber Receipts", type: "Receipt", fields: 5, lastUsed: "1 week ago", color: "bg-orange-500" },
    { id: 4, name: "Vendor Contact List", type: "Contact List", fields: 15, lastUsed: "1 month ago", color: "bg-purple-500" },
    { id: 5, name: "AWS Billing Report", type: "Invoice", fields: 24, lastUsed: "3 days ago", color: "bg-blue-500" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Template Library</h1>
          <p className="text-muted-foreground mt-1">Manage your extraction rules and presets.</p>
        </div>
        <Link href="/dashboard/templates/builder">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create New Template
          </Button>
        </Link>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Create New Card */}
        <Link href="/dashboard/templates/builder">
          <Card className="border-dashed flex flex-col items-center justify-center p-8 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all group h-full min-h-[250px]">
            <div className="h-16 w-16 rounded-full bg-secondary group-hover:bg-background flex items-center justify-center mb-4 transition-colors border border-border group-hover:border-primary/20">
              <Plus className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">Create Template</h3>
            <p className="text-sm text-muted-foreground text-center mt-2 px-4">
              Build a new extraction rule from scratch or use AI suggestions.
            </p>
          </Card>
        </Link>

        {templates.map((template) => (
          <Card key={template.id} className="flex flex-col hover:shadow-md transition-shadow">
            <CardHeader className="flex-row items-start justify-between space-y-0 pb-2">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-lg ${template.color}/10 flex items-center justify-center`}>
                  <FileSpreadsheet className={`h-5 w-5 ${template.color.replace('bg-', 'text-')}`} />
                </div>
                <div>
                  <CardTitle className="text-base">{template.name}</CardTitle>
                  <CardDescription>{template.type}</CardDescription>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="-mr-2 h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                  <DropdownMenuItem><Copy className="mr-2 h-4 w-4" /> Duplicate</DropdownMenuItem>
                  <DropdownMenuItem><Share2 className="mr-2 h-4 w-4" /> Share</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive"><Trash className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent className="flex-1 pt-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wider">Fields</p>
                  <p className="font-medium">{template.fields} extracted</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wider">Last Used</p>
                  <p className="font-medium">{template.lastUsed}</p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge variant="secondary" className="font-normal text-xs">Date</Badge>
                <Badge variant="secondary" className="font-normal text-xs">Invoice #</Badge>
                <Badge variant="secondary" className="font-normal text-xs">Total</Badge>
                {template.fields > 3 && <Badge variant="outline" className="font-normal text-xs">+{template.fields - 3} more</Badge>}
              </div>
            </CardContent>
            <CardFooter className="pt-4 border-t border-border/50">
              <Button variant="ghost" className="w-full text-primary hover:text-primary hover:bg-primary/10">
                Use Template
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}