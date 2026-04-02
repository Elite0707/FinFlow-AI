import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;

        // 1. Receive the user's custom fields from the frontend
        const fieldsString = formData.get("fields") as string;
        const userFields = fieldsString ? JSON.parse(fieldsString) : [];

        if (!file) {
            return NextResponse.json({ error: "File is required" }, { status: 400 });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) return NextResponse.json({ error: "API Key missing" }, { status: 500 });

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const arrayBuffer = await file.arrayBuffer();
        const base64Data = Buffer.from(arrayBuffer).toString("base64");

        // 2. DYNAMIC PROMPT: Inject the user's exact fields or auto-detect
        const prompt = userFields.length > 0
            ? `
        Analyze this document and extract the following specific fields requested by the user:
        ${userFields.map((f: string) => `- ${f}`).join('\n')}

        CRITICAL INSTRUCTIONS:
        - Return ONLY a strict JSON object.
        - The keys in your JSON MUST match the requested fields exactly.
        - If a field is not found in the document, return an empty string "".
        `
            : `
        Analyze this document and auto-detect the key data fields present in it (e.g., Invoice Number, Date, Total Amount, Vendor Name, etc.).

        CRITICAL INSTRUCTIONS:
        - Return ONLY a strict JSON object.
        - The extracted field names (JSON keys) MUST appear EXACTLY as they are printed in the document.
        - PRESERVE EXACT ALPHABET CASING (e.g., if the document says "TOTAL AMOUNT", the key MUST be "TOTAL AMOUNT", not "Total Amount").
        - PRESERVE EXACT SPACING AND SYMBOLS (e.g., if the document says "P.O. NO.", the key MUST be "P.O. NO.").
        - DO NOT invent, guess, synthesize, or reformat any field names. Only use literal text present in the document.
        - The values should be the corresponding text extracted from the document.
        - Do not nest objects or arrays; return a flat JSON.
        `;

        const result = await model.generateContent([
            prompt,
            { inlineData: { data: base64Data, mimeType: file.type } }
        ]);

        const text = result.response.text();
        const cleanJson = text.replace(/```json\n?|\n?```/g, "").trim();

        const data = JSON.parse(cleanJson);
        return NextResponse.json({ fields: data });

    } catch (error) {
        console.error("AI Extraction Error:", error);
        return NextResponse.json({ error: "Extraction failed" }, { status: 500 });
    }
}