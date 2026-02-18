"use client";

import { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { Loader2 } from "lucide-react";

// Ensure worker is set up. 
// We use a CDN to avoid issues with local file serving and webpack configuration
if (typeof window !== "undefined" && "Worker" in window) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;
}

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
        let pdfDocument: pdfjsLib.PDFDocumentProxy | null = null;

        const renderPdf = async () => {
            try {
                setLoading(true);
                setError(null);

                const arrayBuffer = await file.arrayBuffer();
                if (!active) return;

                // Load the document
                const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
                pdfDocument = await loadingTask.promise;

                if (!active) return;

                // Get the first page
                const page = await pdfDocument.getPage(1);

                if (!active) return;

                const canvas = canvasRef.current;
                if (!canvas) return;

                const context = canvas.getContext("2d");
                if (!context) return;

                // Calculate scale to fit the parent container width, or default to 1.0 of the viewport
                // Use a higher scale for better quality on high-DPI screens
                const viewport = page.getViewport({ scale: 5.0 });

                // We set the canvas dimensions to match the viewport
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                // Render URL
                await page.render({
                    canvasContext: context,
                    viewport: viewport,
                }).promise;

                setLoading(false);

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
            if (pdfDocument) {
                pdfDocument.destroy().catch(console.error);
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
