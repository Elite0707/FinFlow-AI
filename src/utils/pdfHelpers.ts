import * as pdfjsLib from 'pdfjs-dist';

// Set worker source
// This is required for pdf.js to work in Next.js environment without manual worker copying
export const countPdfPages = async (file: File): Promise<number> => {
    try {
        // Ensure worker is set before loading
        if (typeof window !== 'undefined' && 'Worker' in window) {
            // Use CDN to avoid local file issues
            pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;
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
