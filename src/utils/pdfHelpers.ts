import * as pdfjsLib from 'pdfjs-dist';

// Set worker source
// This is required for pdf.js to work in Next.js environment without manual worker copying
if (typeof window !== 'undefined' && 'Worker' in window) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
}

/**
 * Counts the number of pages in a PDF file.
 * @param file The PDF file object
 * @returns Promise resolving to the number of pages
 */
export const countPdfPages = async (file: File): Promise<number> => {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        return pdf.numPages;
    } catch (error) {
        console.error("Error reading PDF:", error);
        // If we can't read it (e.g. password protected), we might want to throw or return a specific error code
        // For now, re-throwing so the caller knows something went wrong
        throw new Error("Could not read PDF. File might be corrupted or password protected.");
    }
};
