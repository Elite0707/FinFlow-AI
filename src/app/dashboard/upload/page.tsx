"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText, X, File, AlertCircle, CheckCircle2, Download, Trash2, ExternalLink, Loader2, Crown, AlertTriangle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useFirestore } from "@/hooks/useFirestore";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDistanceToNow } from "date-fns";
import { format } from "date-fns";

interface UploadingFile {
  id: string; // unique id for key
  fileObject: File;
  name: string;
  progress: number;
  status: "uploading" | "completed" | "error";
  error?: string;
}

export default function UploadPage() {
  const [activeTab, setActiveTab] = useState("upload");
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  
  // userFiles comes from our updated hook
  const { uploadFile, userFiles, deleteUserFile, loading, usage } = useFirestore();
  const { toast } = useToast();

  const monthlyUploadCount = usage?.monthlyUploadCount || 0;
  const isLimitReached = monthlyUploadCount >= 10;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isLimitReached) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processFiles = async (files: File[]) => {
    if (isLimitReached) {
      setIsUpgradeModalOpen(true);
      return;
    }

    // Filter out files that are already being uploaded
    const newFiles = files.filter(f => !uploadingFiles.some(uf => uf.name === f.name && uf.status === "uploading"));
    
    if (newFiles.length === 0) return;

    const newUploads = newFiles.map(file => ({
      id: Math.random().toString(36).substring(7),
      fileObject: file,
      name: file.name,
      progress: 0,
      status: "uploading" as const
    }));

    setUploadingFiles(prev => [...prev, ...newUploads]);

    // Process each file
    newUploads.forEach(async (uploadItem) => {
      try {
        await uploadFile(uploadItem.fileObject, (progress) => {
          setUploadingFiles(prev => 
            prev.map(item => 
              item.id === uploadItem.id ? { ...item, progress } : item
            )
          );
        });

        // Success
        setUploadingFiles(prev => 
          prev.map(item => 
            item.id === uploadItem.id ? { ...item, status: "completed", progress: 100 } : item
          )
        );

        toast({
          title: "Upload Successful",
          description: `${uploadItem.name} has been uploaded.`,
        });

        // Remove from list after a short delay
        setTimeout(() => {
          setUploadingFiles(prev => prev.filter(item => item.id !== uploadItem.id));
        }, 2000);

      } catch (error) {
        console.error(error);
        setUploadingFiles(prev => 
          prev.map(item => 
            item.id === uploadItem.id ? { ...item, status: "error", error: "Upload failed" } : item
          )
        );
        toast({
          title: "Upload Failed",
          description: `Failed to upload ${uploadItem.name}`,
          variant: "destructive"
        });
      }
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (isLimitReached) {
      setIsUpgradeModalOpen(true);
      return;
    }

    const droppedFiles = Array.from(e.dataTransfer.files);
    processFiles(droppedFiles);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isLimitReached) {
      setIsUpgradeModalOpen(true);
      e.target.value = ""; // Reset input
      return;
    }

    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      processFiles(selectedFiles);
      // Reset input
      e.target.value = "";
    }
  };

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

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
        <p className="text-muted-foreground mt-1">Upload and manage your files.</p>
      </div>

      <Tabs defaultValue="upload" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="upload">Upload Documents</TabsTrigger>
          <TabsTrigger value="files">My Files ({userFiles.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6 mt-6">
          {isLimitReached && (
            <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Monthly Limit Reached</AlertTitle>
              <AlertDescription className="flex items-center justify-between mt-2">
                <span>You have reached the 10-file monthly upload limit. Upgrade to Pro for unlimited uploads.</span>
                <Button size="sm" onClick={() => setIsUpgradeModalOpen(true)} className="ml-4">
                  Upgrade Now
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">Monthly Usage</span>
            <span className={isLimitReached ? "text-destructive font-medium" : "text-foreground"}>
              {monthlyUploadCount} / 10 uploads
            </span>
          </div>
          <Progress value={(monthlyUploadCount / 10) * 100} className="h-2 mb-6" />

          <div 
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${
              isLimitReached 
                ? "border-muted bg-muted/20 opacity-60 cursor-not-allowed" 
                : isDragging 
                  ? "border-primary bg-primary/5 scale-[1.01]" 
                  : "border-border hover:border-primary/50 hover:bg-muted/30"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center justify-center gap-4">
              <div className={`h-16 w-16 rounded-full flex items-center justify-center ${isLimitReached ? "bg-muted" : "bg-secondary"}`}>
                {isLimitReached ? <AlertTriangle className="h-8 w-8 text-muted-foreground" /> : <Upload className="h-8 w-8 text-muted-foreground" />}
              </div>
              <div>
                <h3 className="text-lg font-semibold">
                  {isLimitReached ? "Upload limit reached" : "Drop GST Invoices here (PDF, JPG, PNG)"}
                </h3>
                {!isLimitReached && (
                  <p className="text-sm text-muted-foreground mt-1">
                    or <label className="text-primary hover:underline cursor-pointer">
                      browse files
                      <input type="file" className="hidden" multiple onChange={handleFileInput} />
                    </label>
                  </p>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Supports PDF, JPG, PNG, XLSX (max 25MB)
              </p>
            </div>
          </div>

          {/* Active Uploads */}
          {uploadingFiles.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Uploading Files</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {uploadingFiles.map((file) => (
                  <div key={file.id} className="flex items-center gap-4 p-3 rounded-lg border border-border bg-card/50">
                    <div className="h-10 w-10 rounded bg-secondary flex items-center justify-center shrink-0">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        {file.status === "error" && <span className="text-destructive text-xs">Failed</span>}
                        {file.status === "completed" && <span className="text-emerald-500 text-xs flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Uploaded</span>}
                      </div>
                      <Progress value={file.progress} className="h-1" />
                    </div>
                    {file.status === "uploading" && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Info Cards */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <File className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-primary">Smart Recognition</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Our AI automatically detects GST Invoices and suggests relevant templates.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-secondary/30 border-border/50">
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                    <AlertCircle className="h-4 w-4 text-foreground" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Privacy First</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Files are encrypted at rest and automatically deleted after 30 days unless you choose to retain them.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="files" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>My Files</CardTitle>
              <CardDescription>Manage your uploaded documents.</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Loading files...</div>
              ) : userFiles.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                  <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <h3 className="text-lg font-medium">No files found</h3>
                  <p className="text-muted-foreground">Upload documents to see them here.</p>
                  <Button variant="outline" className="mt-4" onClick={() => setActiveTab("upload")}>
                    Go to Upload
                  </Button>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>File Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Uploaded</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {userFiles.map((file) => (
                        <TableRow key={file.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <span className="truncate max-w-[200px]" title={file.name}>{file.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-xs uppercase">{file.type?.split('/').pop() || "FILE"}</TableCell>
                          <TableCell>{(file.size / 1024 / 1024).toFixed(2)} MB</TableCell>
                          <TableCell className="text-muted-foreground">
                            {file.createdAt?.seconds 
                              ? format(new Date(file.createdAt.seconds * 1000), "MMM d, yyyy")
                              : "Just now"}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon" asChild>
                                <a href={file.downloadURL} target="_blank" rel="noopener noreferrer" title="Download">
                                  <Download className="h-4 w-4" />
                                </a>
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => handleDelete(file.id, file.storagePath)}
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <p className="text-xs text-muted-foreground text-center py-4 border-t bg-muted/20">
                    Deleting files does not reset your monthly usage limit.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isUpgradeModalOpen} onOpenChange={setIsUpgradeModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Crown className="h-6 w-6 text-primary fill-primary/20" />
              Scale with FinFlow Pro
            </DialogTitle>
            <DialogDescription className="pt-2">
              You&apos;ve reached the free tier limit of 10 uploads per month. Upgrade to Pro for unlimited access and advanced features.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid gap-3">
              <div className="flex items-center gap-3 p-3 rounded-lg border bg-secondary/20">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span className="font-medium">Unlimited Documents</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg border bg-secondary/20">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span className="font-medium">Priority AI Extraction</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg border bg-secondary/20">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span className="font-medium">Excel Export</span>
              </div>
            </div>
          </div>
          <DialogFooter className="flex-col sm:justify-between gap-2">
            <Button 
              className="w-full text-lg py-6" 
              onClick={() => {
                console.log("Upgrade Clicked");
                setIsUpgradeModalOpen(false);
              }}
            >
              Upgrade Now ($19/mo)
            </Button>
            <Button variant="ghost" onClick={() => setIsUpgradeModalOpen(false)}>
              Maybe Later
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}