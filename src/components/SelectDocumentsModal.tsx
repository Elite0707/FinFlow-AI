
import { useState, useMemo, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { FileText, Calendar, Files, CheckCircle2, Lock, Zap } from "lucide-react";
import { format } from "date-fns";
import { UserFile } from "@/hooks/useFirestore";
import { Badge } from "@/components/ui/badge";

interface SelectDocumentsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onProceed: (selectedFileIds: string[]) => void;
    files: UserFile[];
    templateName: string;
    isFree?: boolean;
}

export function SelectDocumentsModal({
    isOpen,
    onClose,
    onProceed,
    files,
    templateName,
    isFree = false
}: SelectDocumentsModalProps) {
    const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);
    const [activeTab, setActiveTab] = useState(isFree ? "files" : "batches");

    // Reset selection state when modal is closed
    useEffect(() => {
        if (!isOpen) {
            setSelectedFileIds([]);
        }
    }, [isOpen]);

    // Group files by batchId
    const batches = useMemo(() => {
        const grouped: Record<string, UserFile[]> = {};
        const noBatchFiles: UserFile[] = [];

        files.forEach(file => {
            // @ts-ignore - batchId might not exist on older types yet
            if (file.batchId) {
                // @ts-ignore
                const bid = file.batchId;
                if (!grouped[bid]) grouped[bid] = [];
                grouped[bid].push(file);
            } else {
                noBatchFiles.push(file);
            }
        });

        const batchList = Object.entries(grouped).map(([batchId, batchFiles]) => {
            // @ts-ignore
            const batchName = batchFiles[0].batchName || "Unnamed Batch";
            // Sort files in batch? They might be already sorted from firestore query
            return {
                batchId,
                batchName,
                files: batchFiles,
                createdAt: batchFiles[0].createdAt, // Use first file date
            };
        });

        // Sort batches by date desc
        batchList.sort((a, b) => {
            const dateA = a.createdAt?.seconds || 0;
            const dateB = b.createdAt?.seconds || 0;
            return dateB - dateA;
        });

        return { batchList, noBatchFiles };
    }, [files]);

    const toggleFile = (fileId: string) => {
        setSelectedFileIds(prev =>
            prev.includes(fileId)
                ? prev.filter(id => id !== fileId)
                : [...prev, fileId]
        );
    };

    const isAllFilesSelected = files.length > 0 && files.every(f => selectedFileIds.includes(f.id));

    const toggleSelectAllFiles = () => {
        if (isAllFilesSelected) {
            setSelectedFileIds([]);
        } else {
            setSelectedFileIds(files.map(f => f.id));
        }
    };

    const toggleBatch = (batchFiles: UserFile[]) => {
        const batchIds = batchFiles.map(f => f.id);
        const allSelected = batchIds.every(id => selectedFileIds.includes(id));

        if (allSelected) {
            // Deselect all
            setSelectedFileIds(prev => prev.filter(id => !batchIds.includes(id)));
        } else {
            // Select all (merge uniquely)
            setSelectedFileIds(prev => Array.from(new Set([...prev, ...batchIds])));
        }
    };

    const isBatchSelected = (batchFiles: UserFile[]) => {
        const batchIds = batchFiles.map(f => f.id);
        return batchIds.length > 0 && batchIds.every(id => selectedFileIds.includes(id));
    };

    const isBatchPartiallySelected = (batchFiles: UserFile[]) => {
        const batchIds = batchFiles.map(f => f.id);
        const selectedCount = batchIds.filter(id => selectedFileIds.includes(id)).length;
        return selectedCount > 0 && selectedCount < batchIds.length;
    };

    const handleProceedClick = () => {
        onProceed(selectedFileIds);
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-2xl h-[80vh] flex flex-col p-0 gap-0">
                <DialogHeader className="px-6 py-4 border-b">
                    <DialogTitle>Select Documents</DialogTitle>
                    <DialogDescription>
                        Choose files to apply the <strong>{templateName}</strong> template to.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-hidden flex flex-col">
                    <Tabs defaultValue={isFree ? "files" : "batches"} className="flex-1 flex flex-col overflow-hidden" onValueChange={setActiveTab}>
                        <div className="px-6 pt-4">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="batches" className="relative">
                                    Recent Batches
                                </TabsTrigger>
                                <TabsTrigger value="files">Individual Files</TabsTrigger>
                            </TabsList>
                        </div>

                        <div className="flex-1 overflow-hidden p-6 pt-4">
                            <ScrollArea className="h-full pr-4">
                                <TabsContent value="batches" className="mt-0 space-y-4 relative">
                                    {isFree ? (
                                        <div className="flex flex-col items-center justify-center py-16 text-center">
                                            <div className="h-16 w-16 rounded-full bg-muted/60 flex items-center justify-center mb-4">
                                                <Lock className="h-8 w-8 text-muted-foreground/60" />
                                            </div>
                                            <h4 className="font-semibold text-lg mb-1">Batch Processing</h4>
                                            <p className="text-sm text-muted-foreground max-w-[280px] mb-4">
                                                Process multiple invoices at once with a single click. Available on paid plans.
                                            </p>
                                            <Badge variant="outline" className="text-xs px-3 py-1 cursor-pointer" onClick={() => window.location.href = '/pricing'}>Upgrade Plan</Badge>
                                        </div>
                                    ) : (
                                        <>
                                            {batches.batchList.map((batch) => {
                                                const isSelected = isBatchSelected(batch.files);
                                                const isPartial = isBatchPartiallySelected(batch.files);

                                                return (
                                                    <div key={batch.batchId}
                                                        className={`border rounded-xl p-4 transition-all ${isSelected ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
                                                    >
                                                        <div className="flex items-start justify-between gap-4">
                                                            <div className="flex items-start gap-4">
                                                                <div className={`mt-1 h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${isSelected ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                                                                    <Files className="h-5 w-5" />
                                                                </div>
                                                                <div>
                                                                    <h4 className="font-semibold text-base flex items-center gap-2">
                                                                        {batch.batchName}
                                                                        {isSelected && <Badge variant="default" className="text-[10px] h-5">Selected</Badge>}
                                                                    </h4>
                                                                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                                                                        <div className="flex items-center gap-1">
                                                                            <Calendar className="h-3 w-3" />
                                                                            <span>
                                                                                {batch.createdAt?.seconds
                                                                                    ? format(new Date(batch.createdAt.seconds * 1000), "MMM d, yyyy")
                                                                                    : "Unknown Date"}
                                                                            </span>
                                                                        </div>
                                                                        <div className="flex items-center gap-1">
                                                                            <FileText className="h-3 w-3" />
                                                                            <span>{batch.files.length} Documents</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <Button
                                                                variant={isSelected ? "default" : "outline"}
                                                                size="sm"
                                                                onClick={() => toggleBatch(batch.files)}
                                                            >
                                                                {isSelected ? "Deselect Batch" : "Select Batch"}
                                                            </Button>
                                                        </div>

                                                        {/* Optional: Show preview of files in batch or simple summary */}
                                                        <div className="mt-4 pt-3 border-t flex flex-wrap gap-2">
                                                            {batch.files.slice(0, 5).map(f => (
                                                                <Badge key={f.id} variant="secondary" className="font-normal text-xs bg-background border">{f.name}</Badge>
                                                            ))}
                                                            {batch.files.length > 5 && (
                                                                <Badge variant="outline" className="text-xs">+{batch.files.length - 5} more</Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}

                                            {batches.batchList.length === 0 && (
                                                <div className="text-center py-12 text-muted-foreground">
                                                    <Files className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                                    <p>No batched uploads found.</p>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </TabsContent>

                                <TabsContent value="files" className="mt-0 space-y-2">
                                    {isFree && (
                                        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 mb-4 flex items-start gap-3">
                                            <Zap className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                            <div>
                                                <h4 className="text-sm font-medium text-primary">Upgrade Plan for Batch Extraction</h4>
                                                <p className="text-xs text-muted-foreground mt-0.5">
                                                    Process multiple invoices simultaneously. Free tier processes files individually.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    {files.length > 0 && (
                                        <div className="flex items-center justify-between px-1 pb-2 mb-2 border-b">
                                            <span className="text-xs text-muted-foreground font-medium">
                                                {files.length} Available Document{files.length !== 1 && 's'}
                                            </span>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-7 px-2.5 text-xs text-primary font-semibold hover:text-primary hover:bg-primary/10"
                                                onClick={toggleSelectAllFiles}
                                            >
                                                {isAllFilesSelected ? "Deselect All" : "Select All"}
                                            </Button>
                                        </div>
                                    )}
                                    {files.map((file) => (
                                        <div key={file.id} className="flex items-center space-x-4 p-3 rounded-lg border hover:bg-secondary/50 transition-colors">
                                            <Checkbox
                                                id={`file-${file.id}`}
                                                checked={selectedFileIds.includes(file.id)}
                                                onCheckedChange={() => toggleFile(file.id)}
                                            />
                                            <div className="flex-1 min-w-0">
                                                <label
                                                    htmlFor={`file-${file.id}`}
                                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer block truncate"
                                                >
                                                    {file.name}
                                                </label>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {file.createdAt?.seconds
                                                        ? format(new Date(file.createdAt.seconds * 1000), "MMM d, yyyy")
                                                        : "Just now"} · {(file.size / 1024 / 1024).toFixed(2)} MB
                                                </p>
                                            </div>
                                            <Badge variant="outline" className="text-[10px]">{file.type.split('/').pop()?.toUpperCase()}</Badge>
                                        </div>
                                    ))}
                                    {files.length === 0 && (
                                        <div className="text-center py-12 text-muted-foreground">
                                            <p>No files found.</p>
                                        </div>
                                    )}
                                </TabsContent>
                            </ScrollArea>
                        </div>
                    </Tabs>
                </div>

                <DialogFooter className="px-6 py-4 border-t bg-muted/10 sm:justify-between items-center">
                    <div className="text-sm text-muted-foreground">
                        {selectedFileIds.length > 0 ? (
                            <span className="flex items-center gap-2 text-foreground font-medium">
                                <CheckCircle2 className="h-4 w-4 text-primary" />
                                {selectedFileIds.length} file{selectedFileIds.length !== 1 && 's'} selected
                            </span>
                        ) : (
                            "Select files to proceed"
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Button variant="ghost" onClick={onClose}>Cancel</Button>
                        <Button onClick={handleProceedClick} disabled={selectedFileIds.length === 0}>
                            Proceed
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
