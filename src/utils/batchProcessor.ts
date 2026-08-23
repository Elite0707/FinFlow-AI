import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

// --- Interfaces ---

export interface FileData {
    name: string;
    url: string; // The download URL from Firebase Storage
    pages?: number;
}

export interface TemplateData {
    name: string;
    extractionFields: string[]; // The fields to look for
}

// Result shape stored in Firestore by the Inngest worker
export interface BatchFileResult {
    fileName: string;
    status: string;
    fields: Record<string, string>;
}

// Firestore batchJob document shape
export interface BatchJob {
    templateName: string;
    templateFields: string[];
    totalFiles: number;
    completedFiles: number;
    status: "processing" | "completed" | "failed";
    results: BatchFileResult[];
    createdAt: any;
}

// --- NEW: Inngest-based Background Processing ---

/**
 * Sends files to the background queue via Inngest.
 * Returns instantly — processing happens in the background.
 * The frontend should listen to the returned batchJobId in Firestore for progress.
 */
export const startBatchProcessing = async (
    files: FileData[],
    template: TemplateData,
    userId: string
): Promise<{ batchJobId: string; totalFiles: number }> => {
    const response = await fetch('/api/batch/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            files: files.map(f => ({ name: f.name, url: f.url, pages: f.pages || 1 })),
            templateName: template.name,
            templateFields: template.extractionFields,
            userId,
        }),
    });

    if (!response.ok) {
        let errorMessage = 'Failed to start batch processing';
        try {
            const errorBody = await response.json();
            errorMessage = errorBody.error || errorMessage;
        } catch { /* ignore parse error */ }
        throw new Error(errorMessage);
    }

    return response.json();
};

// --- Excel Generation from Firestore Results ---

/**
 * Generates the Tally-style Excel ledger from completed batch results.
 * Called when batchJob.status === "completed" and results are available.
 */
/**
 * Generates the Tally-style Excel ledger buffer from completed batch results.
 * Returns the raw buffer + filename for both download and Storage upload.
 */
export const generateExcelBuffer = async (
    results: BatchFileResult[],
    template: TemplateData
): Promise<{ buffer: ArrayBuffer; fileName: string }> => {
    const workbook = new ExcelJS.Workbook();
    const templateFields = template.extractionFields;

    // Identify the "Company Name" field for grouping
    const groupKey = templateFields.find(f =>
        /vendor|company|party|name|customer|client|buyer/i.test(f)
    );

    // Group the data by vendor/party name
    const groupedData: Record<string, BatchFileResult[]> = {};
    results.forEach(row => {
        if (row.status !== 'Success') return; // Skip failed extractions

        let companyName = '';

        if (groupKey) {
            const fields = row.fields;
            if (fields[groupKey] && fields[groupKey] !== '' && fields[groupKey] !== 'Not Found') {
                companyName = fields[groupKey];
            } else {
                const matchingKey = Object.keys(fields).find(
                    k => k.toLowerCase() === groupKey.toLowerCase()
                );
                if (matchingKey && fields[matchingKey] && fields[matchingKey] !== '' && fields[matchingKey] !== 'Not Found') {
                    companyName = fields[matchingKey];
                }
            }
        }

        if (!companyName) {
            companyName = row.fileName
                ? row.fileName.replace(/\.[^/.]+$/, '')
                : 'Uncategorized';
        }

        if (!groupedData[companyName]) groupedData[companyName] = [];
        groupedData[companyName].push(row);
    });

    const companyNames = Object.keys(groupedData);

    // Create the Index Sheet
    const indexSheet = workbook.addWorksheet('Index');
    indexSheet.addRow(['', 'INDEX', '']);
    indexSheet.addRow(['SR NO', 'NAME', 'PAGE NO']);
    indexSheet.getRow(1).font = { bold: true, size: 14 };
    indexSheet.getRow(2).font = { bold: true };
    indexSheet.columns = [
        { width: 10 }, { width: 45 }, { width: 15 }
    ];

    // Create Ledger Sheets
    companyNames.forEach((company, index) => {
        const pageNo = (index + 1).toString();

        // Add to Index
        const iRow = indexSheet.addRow([pageNo, company, pageNo]);
        iRow.getCell(3).value = { text: pageNo, hyperlink: `#'${pageNo}'!A1` } as any;
        iRow.getCell(3).font = { color: { argb: '0563C1' }, underline: true };

        // Create Company Sheet
        const sheet = workbook.addWorksheet(pageNo);
        const colWidths = templateFields.map(f => ({
            width: Math.max(15, Math.min(40, f.length * 1.5 + 5))
        }));
        sheet.columns = colWidths;

        sheet.addRow([`NAME  :---`, company, ...Array(Math.max(0, templateFields.length - 2)).fill('')]);
        sheet.addRow(Array(templateFields.length).fill(''));

        const headerRow = sheet.addRow(templateFields);
        headerRow.font = { bold: true };
        headerRow.eachCell((cell) => {
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFE2EFDA' }
            };
            cell.border = {
                bottom: { style: 'thin', color: { argb: 'FF999999' } }
            };
        });
        sheet.getRow(1).font = { bold: true };

        // Map extracted data directly to template field columns
        groupedData[company].forEach(dataRow => {
            const rowValues = templateFields.map(field => {
                const fields = dataRow.fields;
                if (fields[field] !== undefined) return fields[field];
                const key = Object.keys(fields).find(k => k.toLowerCase() === field.toLowerCase());
                return key ? fields[key] : '';
            });
            sheet.addRow(rowValues);
        });
    });

    // Return buffer + filename (don't download yet)
    const buffer = await workbook.xlsx.writeBuffer();
    const dateStr = new Date().toISOString().slice(0, 10);
    const fileName = `${template.name.replace(/\s+/g, '_')}_Ledger_${dateStr}.xlsx`;

    return { buffer: buffer as ArrayBuffer, fileName };
};

/**
 * Generates and auto-downloads the Excel file (convenience wrapper).
 */
export const generateExcelFromResults = async (
    results: BatchFileResult[],
    template: TemplateData
): Promise<{ buffer: ArrayBuffer; fileName: string }> => {
    const { buffer, fileName } = await generateExcelBuffer(results, template);
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, fileName);
    return { buffer, fileName };
};


// --- LEGACY: Synchronous Batch Processing (kept for small batches / fallback) ---

export const processBatch = async (
    files: FileData[],
    template: TemplateData,
    onProgress?: (current: number, total: number, message: string) => void
): Promise<void> => {
    const results: any[] = [];
    const total = files.length;

    for (let i = 0; i < total; i++) {
        const file = files[i];
        if (onProgress) onProgress(i + 1, total, `AI Analyzing ${file.name}...`);

        const row: any = { FileName: file.name, Status: 'Pending' };

        try {
            let blob: Blob;
            try {
                const response = await fetch(file.url);
                if (!response.ok) {
                    throw new Error(`Failed to download file: ${response.status} ${response.statusText}`);
                }
                const rawBlob = await response.blob();
                const ext = file.name.split('.').pop()?.toLowerCase() || '';
                const mimeMap: Record<string, string> = {
                    'pdf': 'application/pdf',
                    'jpg': 'image/jpeg',
                    'jpeg': 'image/jpeg',
                    'png': 'image/png',
                    'webp': 'image/webp',
                };
                const correctType = mimeMap[ext] || rawBlob.type || 'application/pdf';
                blob = new Blob([rawBlob], { type: correctType });
            } catch (fetchError) {
                throw new Error(`File download failed for "${file.name}": ${fetchError instanceof Error ? fetchError.message : String(fetchError)}`);
            }

            const formData = new FormData();
            formData.append("file", blob, file.name);
            formData.append("fields", JSON.stringify(template.extractionFields));

            const apiRes = await fetch('/api/templates/analyze', {
                method: 'POST',
                body: formData
            });

            if (!apiRes.ok) {
                let serverMessage = '';
                try {
                    const errorBody = await apiRes.json();
                    serverMessage = errorBody.error || errorBody.message || '';
                } catch {
                    serverMessage = apiRes.statusText;
                }
                throw new Error(`API ${apiRes.status}: ${serverMessage || 'Unknown server error'}`);
            }

            const aiData = await apiRes.json();

            if (!aiData.fields || typeof aiData.fields !== 'object') {
                throw new Error('Invalid API response: missing "fields" object');
            }

            row.Status = 'Success';
            Object.assign(row, aiData.fields);

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(`[BatchProcessor] Error on "${file.name}":`, errorMessage);
            row.Status = `Error: ${errorMessage}`;
        }

        results.push(row);
    }

    // Excel generation (legacy path - uses flat row format)
    if (onProgress) onProgress(total, total, "Organizing Smart Ledger...");

    const workbook = new ExcelJS.Workbook();
    const groupKey = template.extractionFields.find(f =>
        /vendor|company|party|name|customer|client|buyer/i.test(f)
    );

    const groupedData: Record<string, any[]> = {};
    results.forEach(row => {
        let companyName = '';
        if (groupKey) {
            if (row[groupKey] && row[groupKey] !== '' && row[groupKey] !== 'Not Found') {
                companyName = row[groupKey];
            } else {
                const matchingKey = Object.keys(row).find(
                    k => k.toLowerCase() === groupKey.toLowerCase()
                );
                if (matchingKey && row[matchingKey] && row[matchingKey] !== '' && row[matchingKey] !== 'Not Found') {
                    companyName = row[matchingKey];
                }
            }
        }
        if (!companyName) {
            companyName = row.FileName
                ? row.FileName.replace(/\.[^/.]+$/, '')
                : 'Uncategorized';
        }
        if (!groupedData[companyName]) groupedData[companyName] = [];
        groupedData[companyName].push(row);
    });

    const companyNames = Object.keys(groupedData);
    const indexSheet = workbook.addWorksheet('Index');
    indexSheet.addRow(['', 'INDEX', '']);
    indexSheet.addRow(['SR NO', 'NAME', 'PAGE NO']);
    indexSheet.getRow(1).font = { bold: true, size: 14 };
    indexSheet.getRow(2).font = { bold: true };
    indexSheet.columns = [
        { width: 10 }, { width: 45 }, { width: 15 }
    ];

    companyNames.forEach((company, index) => {
        const pageNo = (index + 1).toString();
        const iRow = indexSheet.addRow([pageNo, company, pageNo]);
        iRow.getCell(3).value = { text: pageNo, hyperlink: `#'${pageNo}'!A1` } as any;
        iRow.getCell(3).font = { color: { argb: '0563C1' }, underline: true };

        const sheet = workbook.addWorksheet(pageNo);
        const templateFields = template.extractionFields;
        const colWidths = templateFields.map(f => ({
            width: Math.max(15, Math.min(40, f.length * 1.5 + 5))
        }));
        sheet.columns = colWidths;

        sheet.addRow([`NAME  :---`, company, ...Array(Math.max(0, templateFields.length - 2)).fill('')]);
        sheet.addRow(Array(templateFields.length).fill(''));

        const headerRow = sheet.addRow(templateFields);
        headerRow.font = { bold: true };
        headerRow.eachCell((cell) => {
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFE2EFDA' }
            };
            cell.border = {
                bottom: { style: 'thin', color: { argb: 'FF999999' } }
            };
        });
        sheet.getRow(1).font = { bold: true };

        groupedData[company].forEach(dataRow => {
            if (dataRow.Status && dataRow.Status.includes('Error')) return;
            const rowValues = templateFields.map(field => {
                if (dataRow[field] !== undefined) return dataRow[field];
                const key = Object.keys(dataRow).find(k => k.toLowerCase() === field.toLowerCase());
                return key ? dataRow[key] : '';
            });
            sheet.addRow(rowValues);
        });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const dateStr = new Date().toISOString().slice(0, 10);
    const fileName = `Sales_Ledger_${dateStr}.xlsx`;
    saveAs(blob, fileName);

    if (onProgress) onProgress(total, total, "Done!");
};