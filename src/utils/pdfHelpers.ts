// No top-level import to avoid SSR/build issues
// import * as pdfjsLib from 'pdfjs-dist';

export const countPdfPages = async (file: File): Promise<number> => {
    try {
        // Dynamically import pdfjs-dist
        const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");

        // Ensure worker is set before loading
        if (typeof window !== 'undefined' && 'Worker' in window) {
            // Use CDN to avoid local file issues
            try {
                // @ts-ignore
                pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/legacy/build/pdf.worker.min.mjs`;
            } catch (e) {
                console.warn("Worker configuration warning:", e);
            }
        }

        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        return pdf.numPages;
    } catch (error: any) {
        console.error("Error reading PDF:", error);
        // Throw the actual error so we can debug, or a more descriptive one
        throw new Error(error.message || "Could not read PDF. File might be corrupted or password protected.");
    }
};
