import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { error: "GEMINI_API_KEY not configured" },
                { status: 500 }
            );
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Convert file to base64
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64Data = buffer.toString("base64");

        const prompt = `
      Analyze this document (invoice/receipt) and extract the following fields:
      - Invoice Number
      - Date
      - Total Amount
      - Supplier GSTIN
      - Taxable Value
      - Tax Amount

      Return ONLY a JSON object with these keys. If a field is not found, use empty string or 0.
      Example format:
      {
        "Invoice Number": "INV-123",
        "Date": "2024-01-01",
        "Total Amount": "1000.00",
        "Supplier GSTIN": "ABC1234",
        "Taxable Value": "900.00",
        "Tax Amount": "100.00"
      }
    `;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: base64Data,
                    mimeType: file.type,
                },
            },
        ]);

        const response = result.response;
        const text = response.text();

        // Clean up markdown code blocks if present
        const cleanJson = text.replace(/```json\n?|\n?```/g, "").trim();

        try {
            const data = JSON.parse(cleanJson);
            return NextResponse.json({ fields: data });
        } catch (e) {
            console.error("Failed to parse Gemini response:", text);
            return NextResponse.json({ error: "Failed to parse AI response", raw: text }, { status: 500 });
        }

    } catch (error) {
        console.error("Error analyzing document:", error);
        return NextResponse.json(
            { error: "Failed to analyze document" },
            { status: 500 }
        );
    }
}
