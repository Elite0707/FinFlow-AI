"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, MoreHorizontal, FileSpreadsheet, Copy, Trash, Edit, Share2, Download } from "lucide-react";
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
import { startBatchProcessing, generateExcelFromResults, generateExcelBuffer } from "@/utils/batchProcessor";
import type { BatchJob } from "@/utils/batchProcessor";
import { Skeleton } from "@/components/ui/skeleton";
import { doc, onSnapshot } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";

export default function TemplatesPage() {
  const { templates, loading, deleteTemplate, saveTemplate, userFiles, usage, user, stats, saveProcessedExport } = useFirestore();
  const { toast } = useToast();
  const router = useRouter();

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // State for selection modal
  const [selectModalOpen, setSelectModalOpen] = useState(false);
  const [selectedTemplateForUse, setSelectedTemplateForUse] = useState<any>(null);

  // State for batch progress tracking
  const [activeBatchId, setActiveBatchId] = useState<string | null>(null);
  const [batchProgress, setBatchProgress] = useState<{ completed: number; total: number } | null>(null);
  const unsubRef = useRef<(() => void) | null>(null);

  // Clean up Firestore listener on unmount
  useEffect(() => {
    return () => {
      if (unsubRef.current) unsubRef.current();
    };
  }, []);

  const handleEdit = (id: string) => {
    router.push(`/dashboard/templates/builder?id=${id}`);
  };

  // Free tier: batch processing is completely locked
  const isFree = stats?.subscriptionTier === "Free";

  const handleUseTemplate = (template: any) => {
    setSelectedTemplateForUse(template);
    setSelectModalOpen(true);
  };

  const handleProceedWithFiles = async (fileIds: string[]) => {
    if (!selectedTemplateForUse || !user) return;

    // Free tier: only 1 file at a time (individual extraction)
    if (isFree && fileIds.length > 1) {
      toast({
        title: "Free Tier Limit",
        description: "Select only 1 file at a time. Upgrade to Pro for batch processing.",
        variant: "destructive"
      });
      return;
    }

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

    try {
      // Send to Inngest background queue (returns instantly)
      const { batchJobId, totalFiles } = await startBatchProcessing(
        filesToProcess,
        {
          name: selectedTemplateForUse.name,
          extractionFields: selectedTemplateForUse.extractionFields || []
        },
        user.uid
      );

      setActiveBatchId(batchJobId);
      setBatchProgress({ completed: 0, total: totalFiles });


      toast({
        title: "🚀 Processing in Background",
        description: `${totalFiles} file${totalFiles > 1 ? 's' : ''} queued. You can navigate away — we'll notify you when done.`,
      });

      // Listen to Firestore for real-time progress updates
      if (unsubRef.current) unsubRef.current(); // Clean up any previous listener

      const batchDocRef = doc(db, "users", user.uid, "batchJobs", batchJobId);
      unsubRef.current = onSnapshot(batchDocRef, (snapshot) => {
        const data = snapshot.data() as BatchJob | undefined;
        if (!data) return;

        setBatchProgress({ completed: data.completedFiles, total: data.totalFiles });

        if (data.status === "completed") {
          // Batch finished — generate Excel
          toast({
            title: "✅ Batch Complete!",
            description: `All ${data.totalFiles} files processed. Generating Excel...`,
            className: "bg-green-500 text-white"
          });

          generateExcelFromResults(
            data.results,
            {
              name: selectedTemplateForUse.name,
              extractionFields: selectedTemplateForUse.extractionFields || []
            }
          ).then(async ({ buffer, fileName }) => {
            toast({
              title: "📊 Excel Downloaded",
              description: "Your ledger report has been generated.",
              className: "bg-green-500 text-white"
            });

            // Upload the generated Excel to Firebase Storage
            try {
              if (user) {
                const timestamp = Date.now();
                const storagePath = `user_exports/${user.uid}/${timestamp}_${fileName}`;
                const fileRef = ref(storage, storagePath);
                
                await uploadBytes(fileRef, buffer, {
                  contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                });
                
                const downloadURL = await getDownloadURL(fileRef);
                
                // Save reference to Firestore History
                await saveProcessedExport(
                  fileName,
                  selectedTemplateForUse.name,
                  downloadURL,
                  storagePath,
                  data.totalFiles
                );
              }
            } catch (err) {
              console.error("[Templates] Failed to save export to History:", err);
            }
          });

          // Clean up
          setActiveBatchId(null);
          setBatchProgress(null);
          if (unsubRef.current) {
            unsubRef.current();
            unsubRef.current = null;
          }
        }
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

      {/* Batch Progress Banner */}
      {batchProgress && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="py-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                <span className="text-sm font-medium">
                  Processing: {batchProgress.completed} / {batchProgress.total} files
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                {Math.round((batchProgress.completed / batchProgress.total) * 100)}%
              </span>
            </div>
            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
                style={{ width: `${(batchProgress.completed / batchProgress.total) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>
      )}

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
          isFree={isFree}
        />
      )}
    </div>
  );
}