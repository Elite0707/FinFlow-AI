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
            const response = await fetch(file.url);
            const blob = await response.blob();

            // 2. Prepare the payload (File + User's Custom Fields)
            const formData = new FormData();
            formData.append("file", blob, file.name);
            formData.append("fields", JSON.stringify(template.extractionFields));

            // 3. Call your new dynamic API
            const apiRes = await fetch('/api/templates/analyze', {
                method: 'POST',
                body: formData
            });

            if (!apiRes.ok) throw new Error("API Failed");

            const aiData = await apiRes.json();

            // 4. Merge the AI's perfect JSON into our row
            row.Status = 'Success';
            Object.assign(row, aiData.fields);

        } catch (error) {
            console.error(`Error on ${file.name}:`, error);
            row.Status = `Error: ${error instanceof Error ? error.message : String(error)}`;
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
        sheet.columns = [
            { width: 15 }, // DATE
            { width: 30 }, // PARTICULARS
            { width: 15 }, // DEBIT
            { width: 15 }, // CREDIT
            { width: 15 }  // BALANCE
        ];

        // Add Ledger Headers
        sheet.addRow(['NAME  :---', company, '', '', '']);
        sheet.addRow(['', '', '', '', '']);
        const headerRow = sheet.addRow(['DATE', 'PARTICULARS', 'DEBIT', 'CREDIT', 'BALANCE']);
        headerRow.font = { bold: true };
        sheet.getRow(1).font = { bold: true };

        // 4e. Map Extracted Data to Ledger Format
        groupedData[company].forEach(dataRow => {
            if (dataRow.Status.includes('Error')) return; // Skip failed extractions

            // Find the closest matching keys for Date, Invoice, and Amount
            const dateKey = Object.keys(dataRow).find(k => k.toLowerCase().includes('date'));
            const invKey = Object.keys(dataRow).find(k => k.toLowerCase().includes('inv') || k.toLowerCase().includes('num'));
            const amtKey = Object.keys(dataRow).find(k => k.toLowerCase().includes('total') || k.toLowerCase().includes('amount'));

            const dateVal = dateKey ? dataRow[dateKey] : '';
            const invVal = (invKey && dataRow[invKey] && dataRow[invKey].trim() !== "")
                ? dataRow[invKey]
                : dataRow.FileName;
            const amtVal = amtKey ? dataRow[amtKey] : '';

            // Assuming invoices are Sales (Debits). Adjust if you have payment receipts (Credits).
            sheet.addRow([dateVal, invVal, amtVal, '', '']);
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