"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText, X, File, AlertCircle, CheckCircle2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function UploadPage() {
  const [files, setFiles] = useState<any[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    // Mock file handling
    const droppedFiles = Array.from(e.dataTransfer.files).map(file => ({
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2) + " MB",
      type: file.type,
      progress: 0,
      status: "pending"
    }));
    
    setFiles(prev => [...prev, ...droppedFiles]);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files).map(file => ({
        name: file.name,
        size: (file.size / 1024 / 1024).toFixed(2) + " MB",
        type: file.type,
        progress: 0,
        status: "pending"
      }));
      setFiles(prev => [...prev, ...selectedFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const startProcessing = () => {
    setUploading(true);
    // Mock upload progress
    const interval = setInterval(() => {
      setFiles(prev => prev.map(f => {
        if (f.progress >= 100) return { ...f, status: "completed" };
        return { ...f, progress: f.progress + 10, status: "processing" };
      }));
    }, 500);

    setTimeout(() => {
      clearInterval(interval);
      setUploading(false);
      setFiles(prev => prev.map(f => ({ ...f, progress: 100, status: "completed" })));
    }, 5000);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Upload Documents</h1>
        <p className="text-muted-foreground mt-1">Upload PDFs, images, or Excel files for extraction.</p>
      </div>

      <div 
        className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${
          isDragging 
            ? "border-primary bg-primary/5 scale-[1.01]" 
            : "border-border hover:border-primary/50 hover:bg-muted/30"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center">
            <Upload className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Drag and drop files here</h3>
            <p className="text-sm text-muted-foreground mt-1">
              or <label className="text-primary hover:underline cursor-pointer">
                browse files
                <input type="file" className="hidden" multiple onChange={handleFileInput} />
              </label>
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            Supports PDF, JPG, PNG, XLSX (max 25MB)
          </p>
        </div>
      </div>

      {files.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Files ({files.length})</CardTitle>
            <CardDescription>Review files before processing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {files.map((file, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-lg border border-border bg-card/50">
                <div className="h-10 w-10 rounded bg-secondary flex items-center justify-center shrink-0">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <button onClick={() => removeFile(i)} className="text-muted-foreground hover:text-destructive transition-colors">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{file.size}</span>
                    {file.status === "processing" && <span className="text-primary">Processing...</span>}
                    {file.status === "completed" && <span className="text-emerald-500 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Ready</span>}
                  </div>
                  {(file.status === "processing" || file.status === "completed") && (
                    <Progress value={file.progress} className="h-1 mt-2" />
                  )}
                </div>
              </div>
            ))}

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setFiles([])}>Clear All</Button>
              <Button onClick={startProcessing} disabled={uploading || files.every(f => f.status === "completed")}>
                {uploading ? "Processing..." : "Start Extraction"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
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
                  Our AI automatically detects document types (invoices, receipts, etc.) and suggests relevant templates.
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
    </div>
  );
}