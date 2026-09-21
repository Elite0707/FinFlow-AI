"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BatchJobDoc } from "@/hooks/useFirestore";
import { formatDistanceToNow } from "date-fns";
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Ban,
  FileText,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Info,
  Clock,
  Layers,
} from "lucide-react";

interface BatchDetailsModalProps {
  job: BatchJobDoc | null;
  isOpen: boolean;
  onClose: () => void;
  onCancelJob?: (jobId: string) => Promise<void>;
}

export function BatchDetailsModal({
  job,
  isOpen,
  onClose,
  onCancelJob,
}: BatchDetailsModalProps) {
  const [expandedFileIndex, setExpandedFileIndex] = useState<number | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  if (!job) return null;

  const totalFiles = job.totalFiles || 0;
  const completedFiles = job.completedFiles || 0;
  const progressPercent = totalFiles > 0 ? Math.round((completedFiles / totalFiles) * 100) : 0;

  const results = job.results || [];
  const successCount = results.filter((r) => r.status === "Success").length;
  const failedCount = results.filter((r) => r.status === "Failed").length;
  const cancelledCount = results.filter((r) => r.status === "Cancelled").length;

  const isProcessing = job.status === "processing";

  const handleCancelClick = async () => {
    if (!onCancelJob || isCancelling) return;
    try {
      setIsCancelling(true);
      await onCancelJob(job.id);
    } catch (err) {
      console.error("Failed to cancel job from modal:", err);
    } finally {
      setIsCancelling(false);
    }
  };

  const toggleExpand = (index: number) => {
    setExpandedFileIndex(expandedFileIndex === index ? null : index);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-6 overflow-hidden">
        {/* Modal Header */}
        <DialogHeader className="pb-4 border-b border-border/60">
          <div className="flex items-center justify-between gap-4 pr-6">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Layers className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold tracking-tight">
                  {job.templateName}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Batch Job ID: <code className="text-foreground/80">{job.id.slice(0, 12)}...</code>
                </DialogDescription>
              </div>
            </div>

            {/* Overall Status Badge */}
            {job.status === "processing" ? (
              <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 gap-1.5 px-3 py-1 text-xs">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Processing
              </Badge>
            ) : job.status === "completed" ? (
              <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 gap-1.5 px-3 py-1 text-xs">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Completed
              </Badge>
            ) : job.status === "cancelled" ? (
              <Badge variant="outline" className="bg-orange-500/10 text-orange-400 border-orange-500/20 gap-1.5 px-3 py-1 text-xs">
                <Ban className="h-3.5 w-3.5" />
                Cancelled
              </Badge>
            ) : (
              <Badge variant="destructive" className="gap-1.5 px-3 py-1 text-xs">
                <AlertCircle className="h-3.5 w-3.5" />
                Failed
              </Badge>
            )}
          </div>
        </DialogHeader>

        {/* Progress & Quick Telemetry */}
        <div className="py-4 space-y-3 border-b border-border/60">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              Started{" "}
              {job.createdAt?.seconds
                ? formatDistanceToNow(new Date(job.createdAt.seconds * 1000), { addSuffix: true })
                : "recently"}
            </span>
            <span className="font-semibold text-foreground">
              {completedFiles} / {totalFiles} files processed ({progressPercent}%)
            </span>
          </div>

          {/* Progress Bar */}
          <div className="h-2 w-full bg-secondary rounded-full overflow-hidden flex">
            <div
              className="bg-emerald-500 h-full transition-all duration-300"
              style={{ width: `${totalFiles > 0 ? (successCount / totalFiles) * 100 : 0}%` }}
              title={`${successCount} Successful`}
            />
            <div
              className="bg-destructive h-full transition-all duration-300"
              style={{ width: `${totalFiles > 0 ? (failedCount / totalFiles) * 100 : 0}%` }}
              title={`${failedCount} Failed`}
            />
            <div
              className="bg-orange-400/80 h-full transition-all duration-300"
              style={{ width: `${totalFiles > 0 ? (cancelledCount / totalFiles) * 100 : 0}%` }}
              title={`${cancelledCount} Cancelled`}
            />
            {isProcessing && (
              <div
                className="bg-yellow-500/70 h-full animate-pulse transition-all duration-300"
                style={{
                  width: `${
                    totalFiles > 0 ? ((totalFiles - completedFiles) / totalFiles) * 100 : 0
                  }%`,
                }}
                title="Processing remaining..."
              />
            )}
          </div>

          {/* Summary Chips */}
          <div className="flex items-center gap-2 pt-1">
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-medium flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              {successCount} Success
            </span>
            {failedCount > 0 && (
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-destructive/10 text-destructive font-medium flex items-center gap-1">
                <XCircle className="h-3 w-3" />
                {failedCount} Failed
              </span>
            )}
            {cancelledCount > 0 && (
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-orange-500/10 text-orange-400 font-medium flex items-center gap-1">
                <Ban className="h-3 w-3" />
                {cancelledCount} Cancelled
              </span>
            )}
          </div>
        </div>

        {/* Scrollable Document Results List */}
        <div className="flex-1 overflow-y-auto py-4 pr-1 space-y-3 custom-scrollbar">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Document Extraction Details ({results.length} results)
          </h4>

          {results.length === 0 ? (
            <div className="p-8 text-center border border-dashed rounded-lg text-muted-foreground text-sm">
              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
              Processing documents in background queue...
            </div>
          ) : (
            results.map((item, idx) => {
              const isSuccess = item.status === "Success";
              const isFailed = item.status === "Failed";
              const isCancelled = item.status === "Cancelled";
              const isExpanded = expandedFileIndex === idx;

              return (
                <div
                  key={idx}
                  className={`group rounded-lg border transition-all duration-200 overflow-hidden ${
                    isFailed
                      ? "border-destructive/40 bg-destructive/5 hover:border-destructive"
                      : isCancelled
                      ? "border-orange-500/30 bg-orange-500/5 hover:border-orange-500/50"
                      : "border-border/60 bg-muted/20 hover:border-border"
                  }`}
                >
                  {/* Row Header */}
                  <div
                    onClick={() => (isSuccess || isFailed) && toggleExpand(idx)}
                    className="p-3.5 flex items-center justify-between gap-3 cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`p-2 rounded-md ${
                          isSuccess
                            ? "bg-emerald-500/10 text-emerald-400"
                            : isFailed
                            ? "bg-destructive/10 text-destructive"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate max-w-[280px] sm:max-w-[360px]" title={item.fileName}>
                          {item.fileName}
                        </p>
                        {item.fields && item.fields.__party_name && (
                          <p className="text-xs text-muted-foreground truncate">
                            Buyer: <span className="text-foreground/90 font-medium">{item.fields.__party_name}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Status Badge & Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      {isSuccess && (
                        <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 gap-1 hover:bg-emerald-500/25">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Success
                        </Badge>
                      )}

                      {isFailed && (
                        <Badge variant="destructive" className="gap-1 shadow-sm">
                          <XCircle className="h-3.5 w-3.5" />
                          Failed
                        </Badge>
                      )}

                      {isCancelled && (
                        <Badge variant="outline" className="bg-orange-500/10 text-orange-400 border-orange-500/30 gap-1">
                          <Ban className="h-3.5 w-3.5" />
                          Cancelled
                        </Badge>
                      )}

                      {(isSuccess || isFailed) && (
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Failure Reason Banner */}
                  {isFailed && (
                    <div className="px-3.5 pb-3">
                      <div className="p-2.5 rounded-md bg-destructive/10 border border-destructive/20 text-xs text-destructive flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold block">Extraction Error:</span>
                          <span className="text-destructive/90">{item.error || "Unknown error occurred during processing."}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Extracted Fields Preview Table */}
                  {isExpanded && isSuccess && item.fields && (
                    <div className="px-3.5 pb-3.5 pt-1 border-t border-border/40 bg-background/50">
                      <p className="text-[11px] font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                        <Info className="h-3 w-3 text-primary" /> Extracted Fields Preview
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {Object.entries(item.fields).map(([key, val]) => {
                          if (key === "__party_name") return null;
                          return (
                            <div key={key} className="p-2 rounded bg-muted/40 border border-border/30">
                              <span className="text-muted-foreground block text-[10px] uppercase font-semibold">
                                {key}
                              </span>
                              <span className="font-medium text-foreground truncate block">
                                {String(val) || "—"}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <DialogFooter className="pt-4 border-t border-border/60 flex items-center justify-between sm:justify-between">
          <div>
            {isProcessing && onCancelJob && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleCancelClick}
                disabled={isCancelling}
                className="gap-1.5"
              >
                {isCancelling ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  <>
                    <Ban className="h-3.5 w-3.5" />
                    Cancel Process
                  </>
                )}
              </Button>
            )}
          </div>

          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
