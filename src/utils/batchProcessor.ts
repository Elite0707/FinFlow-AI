import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

// --- Interfaces ---

export interface FileData {
    name: string;
    url: string; // The download URL from Firebase Storage
}

export interface TemplateData {
    name: string;
    extractionFields: string[]; // The fields to look for
}



// --- Main Function ---

// Inside batchProcessor.ts

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
            // 1. Fetch the PDF from Firebase so we can send it to our API
            let blob: Blob;
            try {
                const response = await fetch(file.url);
                if (!response.ok) {
                    throw new Error(`Failed to download file: ${response.status} ${response.statusText}`);
                }
                const rawBlob = await response.blob();

                // Firebase blobs often lose their MIME type (comes as '' or 'application/octet-stream').
                // Gemini needs the correct mimeType, so we derive it from the file extension.
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

            // 2. Prepare the payload (File + User's Custom Fields)
            const formData = new FormData();
            formData.append("file", blob, file.name);
            formData.append("fields", JSON.stringify(template.extractionFields));

            // 3. Call the analysis API
            const apiRes = await fetch('/api/templates/analyze', {
                method: 'POST',
                body: formData
            });

            if (!apiRes.ok) {
                // Try to extract the server's error message from the response body
                let serverMessage = '';
                try {
                    const errorBody = await apiRes.json();
                    serverMessage = errorBody.error || errorBody.message || '';
                } catch {
                    // Response body wasn't JSON, use status text
                    serverMessage = apiRes.statusText;
                }
                throw new Error(`API ${apiRes.status}: ${serverMessage || 'Unknown server error'}`);
            }

            const aiData = await apiRes.json();

            // 4. Merge the AI's JSON into our row
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

    // ... Keep the ExcelJS Tally Ledger Generation exactly as it is below this! ...

    // --- 4. TALLY-STYLE LEDGER EXCEL GENERATION ---
    if (onProgress) onProgress(total, total, "Organizing Smart Ledger...");

    const workbook = new ExcelJS.Workbook();

    // 4a. Identify the "Company Name" for grouping
    const groupKey = template.extractionFields.find(f =>
        f.toLowerCase().match(/vendor|company|party|name|customer|client|buyer/i)
    );

    // 4b. Group the Data
    const groupedData: Record<string, any[]> = {};
    results.forEach(row => {
        let companyName = (groupKey && row[groupKey] && row[groupKey] !== "Not Found") ? row[groupKey] : "Uncategorized";
        if (!groupedData[companyName]) groupedData[companyName] = [];
        groupedData[companyName].push(row);
    });

    const companyNames = Object.keys(groupedData);

    // 4c. Create the Index Sheet
    const indexSheet = workbook.addWorksheet('Index');
    indexSheet.addRow(['', 'INDEX', '']);
    indexSheet.addRow(['SR NO', 'NAME', 'PAGE NO']);

    // Style Index Header
    indexSheet.getRow(1).font = { bold: true, size: 14 };
    indexSheet.getRow(2).font = { bold: true };
    indexSheet.columns = [
        { width: 10 }, { width: 45 }, { width: 15 }
    ];

    // 4d. Create Ledger Sheets (1, 2, 3...)
    companyNames.forEach((company, index) => {
        const pageNo = (index + 1).toString();

        // Add to Index
        const iRow = indexSheet.addRow([pageNo, company, pageNo]);
        iRow.getCell(3).value = { text: pageNo, hyperlink: `#'${pageNo}'!A1` };
        iRow.getCell(3).font = { color: { argb: '0563C1' }, underline: true };

        // Create Company Sheet
        const sheet = workbook.addWorksheet(pageNo);

        // Dynamic columns from the user's template fields
        const templateFields = template.extractionFields;
        const colWidths = templateFields.map(f => {
          const len = f.length;
          return { width: Math.max(15, Math.min(40, len * 1.5 + 5)) };
        });
        sheet.columns = colWidths;

        // Add Company Name header
        sheet.addRow([`NAME  :---`, company, ...Array(Math.max(0, templateFields.length - 2)).fill('')]);
        sheet.addRow(Array(templateFields.length).fill(''));

        // Add column headers from the template fields
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
            if (dataRow.Status && dataRow.Status.includes('Error')) return;

            const rowValues = templateFields.map(field => {
              // Try exact match first, then case-insensitive match
              if (dataRow[field] !== undefined) return dataRow[field];
              const key = Object.keys(dataRow).find(k => k.toLowerCase() === field.toLowerCase());
              return key ? dataRow[key] : '';
            });

            sheet.addRow(rowValues);
        });
    });

    // --- 5. TRIGGER DOWNLOAD ---
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    const dateStr = new Date().toISOString().slice(0, 10);
    const fileName = `Sales_Ledger_${dateStr}.xlsx`;

    saveAs(blob, fileName);

    if (onProgress) onProgress(total, total, "Done!");
};