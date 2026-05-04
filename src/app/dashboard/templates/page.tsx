"use client";

import { useState } from "react";
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
import { useRouter } from "next/navigation";
import { useFirestore } from "@/hooks/useFirestore";
import { useToast } from "@/components/ui/use-toast";
import { formatDistanceToNow } from "date-fns";
import { SelectDocumentsModal } from "@/components/SelectDocumentsModal";
import { DeleteConfirmationModal } from "@/components/DeleteConfirmationModal";
import { processBatch } from "@/utils/batchProcessor";
import { Skeleton } from "@/components/ui/skeleton";

export default function TemplatesPage() {
  const { templates, loading, deleteTemplate, saveTemplate, userFiles } = useFirestore(); // Fetch userFiles
  const { toast } = useToast();
  const router = useRouter();

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // New state for selection modal
  const [selectModalOpen, setSelectModalOpen] = useState(false);
  const [selectedTemplateForUse, setSelectedTemplateForUse] = useState<any>(null);

  const handleEdit = (id: string) => {
    router.push(`/dashboard/templates/builder?id=${id}`);
  };

  const handleUseTemplate = (template: any) => {
    setSelectedTemplateForUse(template);
    setSelectModalOpen(true);
  };

  const handleProceedWithFiles = async (fileIds: string[]) => {
    if (!selectedTemplateForUse) return;

    // Filter userFiles to get the full file objects for the selected IDs
    const filesToProcess = userFiles
      .filter(f => fileIds.includes(f.id))
      .map(f => ({
        name: f.name,
        // @ts-ignore
        url: f.downloadURL
      }));

    if (filesToProcess.length === 0) {
      toast({ title: "Error", description: "No valid files selected.", variant: "destructive" });
      return;
    }

    setSelectModalOpen(false);

    toast({
      title: "Batch Processing Started",
      description: `Analyzing ${filesToProcess.length} file${filesToProcess.length > 1 ? 's' : ''} with "${selectedTemplateForUse.name}"...`,
    });

    try {
      await processBatch(
        filesToProcess,
        {
          name: selectedTemplateForUse.name,
          extractionFields: selectedTemplateForUse.extractionFields || []
        },
        (current, total, message) => {
          console.log(`Progress: ${current}/${total} - ${message}`);
        }
      );

      toast({
        title: "Batch Complete",
        description: "Excel report has been generated and downloaded.",
        className: "bg-green-500 text-white"
      });

    } catch (e) {
      const errorDetail = e instanceof Error ? e.message : "An unexpected error occurred.";
      console.error("[Templates] Batch processing error:", errorDetail);
      toast({
        title: "Batch Processing Failed",
        description: errorDetail,
        variant: "destructive"
      });
    }
  };

  const handleDuplicate = async (template: any) => {
    try {
      await saveTemplate({
        name: `Copy of ${template.name}`,
        documentType: template.documentType,
        extractionFields: template.extractionFields
      }, true); // Save as draft initially
      toast({ title: "Template Duplicated", description: "A copy has been created." });
    } catch (e) {
      toast({ title: "Error", description: "Failed to duplicate template.", variant: "destructive" });
    }
  };

  const handleDeleteClick = (id: string) => {
    setTemplateToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!templateToDelete) return;

    setIsDeleting(true);
    try {
      await deleteTemplate(templateToDelete);
      toast({ title: "Template Deleted", description: "The template has been removed." });
      setDeleteModalOpen(false);
      setTemplateToDelete(null);
    } catch (e) {
      toast({ title: "Error", description: "Failed to delete template.", variant: "destructive" });
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        {/* Header skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Skeleton className="h-9 w-52" />
            <Skeleton className="h-4 w-72 mt-2" />
          </div>
          <Skeleton className="h-10 w-44" />
        </div>

        {/* Template cards grid skeleton */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="flex flex-col">
              <CardHeader className="flex-row items-start justify-between space-y-0 pb-2">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div>
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-3 w-24 mt-1.5" />
                  </div>
                </div>
                <Skeleton className="h-8 w-8 rounded" />
              </CardHeader>
              <CardContent className="flex-1 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Skeleton className="h-3 w-12 mb-1" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <div>
                    <Skeleton className="h-3 w-14 mb-1" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Skeleton className="h-5 w-20 rounded-full" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-5 w-24 rounded-full" />
                </div>
              </CardContent>
              <CardFooter className="pt-4 border-t border-border/50">
                <Skeleton className="h-9 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

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
                <div className={`h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center`}>
                  <FileSpreadsheet className={`h-5 w-5 text-blue-500`} />
                </div>
                <div>
                  <CardTitle className="text-base">{template.name}</CardTitle>
                  <CardDescription>{template.extractionFields?.length || 0} fields mapped</CardDescription>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="-mr-2 h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleEdit(template.id)}><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDuplicate(template)}><Copy className="mr-2 h-4 w-4" /> Duplicate</DropdownMenuItem>
                  <DropdownMenuItem><Share2 className="mr-2 h-4 w-4" /> Share</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteClick(template.id)}><Trash className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent className="flex-1 pt-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wider">Fields</p>
                  <p className="font-medium">{template.extractionFields?.length || 0} extracted</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wider">Created</p>
                  <p className="font-medium">
                    {template.createdAt?.seconds
                      ? formatDistanceToNow(new Date(template.createdAt.seconds * 1000), { addSuffix: true })
                      : "Just now"}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {template.extractionFields?.slice(0, 3).map((field, i) => (
                  <Badge key={i} variant="secondary" className="font-normal text-xs">{field}</Badge>
                ))}
                {(template.extractionFields?.length || 0) > 3 && (
                  <Badge variant="outline" className="font-normal text-xs">
                    +{template.extractionFields.length - 3} more
                  </Badge>
                )}
                {template.isDraft && <Badge variant="outline" className="border-yellow-500 text-yellow-500 text-xs">Draft</Badge>}
              </div>
            </CardContent>
            <CardFooter className="pt-4 border-t border-border/50">
              <Button variant="ghost" className="w-full text-primary hover:text-primary hover:bg-primary/10" onClick={() => handleUseTemplate(template)}>
                Use Template
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        loading={isDeleting}
        title="Delete Template?"
        description="Are you sure you want to delete this template? This action cannot be undone."
      />

      {/* Select Documents Modal */}
      {selectedTemplateForUse && (
        <SelectDocumentsModal
          isOpen={selectModalOpen}
          onClose={() => setSelectModalOpen(false)}
          onProceed={handleProceedWithFiles}
          files={userFiles}
          templateName={selectedTemplateForUse.name}
        />
      )}
    </div>
  );
}