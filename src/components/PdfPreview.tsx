"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import type { PDFDocumentProxy } from "pdfjs-dist";

interface PdfPreviewProps {
    file: File;
    className?: string;
}

export default function PdfPreview({ file, className }: PdfPreviewProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let active = true;
        let pdfDocument: PDFDocumentProxy | null = null;

        const renderPdf = async () => {
            try {
                setLoading(true);
                setError(null);

                if (!file) return;

                const arrayBuffer = await file.arrayBuffer();
                if (!active) return;

                // Dynamically import pdfjs-dist
                // Dynamically import pdfjs-dist
                // Use legacy build for better compatibility with Next.js/Webpack
                const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");

                // Configure worker
                if (typeof window !== "undefined" && "Worker" in window) {
                    try {
                        // @ts-ignore
                        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/legacy/build/pdf.worker.min.mjs`;
                    } catch (e) {
                        console.warn("Worker configuration warning:", e);
                    }
                }

                // Load the document
                const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
                pdfDocument = await loadingTask.promise;

                if (!active || !pdfDocument) return;

                // Get the first page
                const page = await pdfDocument.getPage(1);

                if (!active) return;

                const canvas = canvasRef.current;
                if (!canvas) return;

                const context = canvas.getContext("2d");
                if (!context) return;

                // Calculate scale to fit the parent container width
                // Using a higher scale for better quality, but verify viewport size
                const viewport = page.getViewport({ scale: 1.5 });

                // We set the canvas dimensions to match the viewport
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                // Render URL
                await page.render({
                    canvasContext: context,
                    viewport: viewport,
                }).promise;

                if (active) {
                    setLoading(false);
                }

            } catch (err: any) {
                if (!active) return;
                console.error("Error rendering PDF:", err);
                setError("Could not render PDF preview.");
                setLoading(false);
            }
        };

        renderPdf();

        return () => {
            active = false;
            // Best effort cleanup
            if (pdfDocument) {
                try {
                    // @ts-ignore - destroy might not be in the type definition depending on version but exists in runtime usually
                    if (typeof pdfDocument.destroy === 'function') {
                        pdfDocument.destroy();
                    }
                } catch (e) {
                    console.error("Error destroying PDF document:", e);
                }
            }
        };
    }, [file]);

    return (
        <div className={`relative flex items-center justify-center bg-gray-100 overflow-auto rounded-md border ${className}`}>
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            )}
            {error ? (
                <div className="text-destructive text-sm p-4 text-center">{error}</div>
            ) : (
                <canvas ref={canvasRef} className="w-full h-auto shadow-md" />
            )}
        </div>
    );
}
