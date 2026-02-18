import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Trash2, X, UploadCloud, Loader2, CheckCircle2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";

interface UploadingFile {
    id: string;
    name: string;
    progress: number;
    status: "uploading" | "completed" | "error" | "canceled";
    error?: string;
}

interface ReviewUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    files: File[];
    onRemove: (index: number) => void;
    onConfirm: (batchName: string) => void;
    uploadingFiles: UploadingFile[];
    isUploading: boolean;
}

export function ReviewUploadModal({
    isOpen,
    onClose,
    files,
    onRemove,
    onConfirm,
    uploadingFiles,
    isUploading,
}: ReviewUploadModalProps) {
    const [batchName, setBatchName] = useState("");

    // Reset batch name when modal opens
    useEffect(() => {
        if (isOpen) {
            setBatchName("");
        }
    }, [isOpen]);

    const handleConfirm = () => {
        const finalBatchName = batchName.trim() || `Upload - ${format(new Date(), "MMM d, yyyy h:mm a")}`;
        onConfirm(finalBatchName);
    };

    const totalSize = files.reduce((acc, file) => acc + file.size, 0);
    const formattedTotalSize = (totalSize / 1024 / 1024).toFixed(2);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !isUploading && !open && onClose()}>
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>Review Upload</DialogTitle>
                    <DialogDescription>
                        Review your files before uploading. You can add a batch name for easier organization.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-4 py-4">
                    <ScrollArea className="h-[300px] w-full rounded-md border p-4">
                        {files.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                                <UploadCloud className="h-10 w-10 mb-2 opacity-50" />
                                <p>No files selected</p>
                            </div>
                        )}
                        <div className="space-y-3">
                            {files.map((file, index) => {
                                // Check if this file is currently uploading or has status
                                // We match by name for simplicity in this context, or index if possible.
                                // Since staging files are Files, and uploadingFiles are wrappers, we might correspond them by index or name.
                                // However, the prompt implies the list view changes or we show progress *during* upload phase in this modal?
                                // The requirements say "Show a progress bar during upload." and "Close the modal... only after success."
                                // So we need to map staging files to uploading status if implemented that way.
                                // Let's rely on the uploadingFiles prop to show status if the file is in there.

                                // Assuming unique names for now as per simple logic, or just display raw list if not uploading.
                                // Actually, if we are uploading, we should probably show the uploading status for everything.

                                const uploadStatus = uploadingFiles.find(uf => uf.name === file.name);

                                return (
                                    <div key={`${file.name}-${index}`} className="flex items-center justify-between gap-3 p-3 rounded-lg border bg-card">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="h-10 w-10 rounded bg-secondary flex items-center justify-center shrink-0">
                                                <FileText className="h-5 w-5 text-primary" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-medium text-sm truncate max-w-[200px]">{file.name}</p>
                                                <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0">
                                            {isUploading && uploadStatus ? (
                                                <div className="flex flex-col items-end gap-1 w-[100px]">
                                                    {uploadStatus.status === 'completed' ? (
                                                        <span className="text-xs text-emerald-500 flex items-center"><CheckCircle2 className="h-3 w-3 mr-1" /> Done</span>
                                                    ) : uploadStatus.status === 'error' ? (
                                                        <span className="text-xs text-destructive">Error</span>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground">{Math.round(uploadStatus.progress)}%</span>
                                                    )}
                                                    <Progress value={uploadStatus.progress} className="h-1 w-full" />
                                                </div>
                                            ) : (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-destructive transition-colors"
                                                    onClick={() => onRemove(index)}
                                                    disabled={isUploading}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </ScrollArea>

                    <div className="flex items-center justify-between text-sm px-1">
                        <span className="text-muted-foreground">Total Files: {files.length}</span>
                        <span className="font-medium">{formattedTotalSize} MB</span>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="batchName" className="text-sm font-medium">
                            Batch Name (Optional)
                        </label>
                        <Input
                            id="batchName"
                            placeholder={`e.g. Feb 2026 Invoices (Auto: Upload - ${format(new Date(), "MMM d, h:mm a")})`}
                            value={batchName}
                            onChange={(e) => setBatchName(e.target.value)}
                            disabled={isUploading}
                        />
                    </div>
                </div>

                <DialogFooter className="sm:justify-between gap-2">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isUploading}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={files.length === 0 || isUploading}
                        className="gap-2"
                    >
                        {isUploading && <Loader2 className="h-4 w-4 animate-spin" />}
                        {isUploading ? "Uploading..." : "Confirm & Upload"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
