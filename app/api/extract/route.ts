import { createGroq } from "@ai-sdk/groq";
import { generateText } from "ai";
import { NextRequest, NextResponse } from "next/server";

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

interface ExtractedData {
  transactionReference: string
  amount?: string
  senderName?: string
  senderAccount?: string
  receiverName?: string
  receiverAccount?: string
  date?: string
  time?: string
  paymentMethod: "cbe" | "telebirr" | "dashen" | "abyssinia" | "cbebirr" | "mpesa" | "unknown"
  bankName?: string
  transactionType?: string
  status?: string
  additionalNotes?: string
}

function parseExtractedData(text: string): ExtractedData {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      const validMethods = ["cbe", "telebirr", "dashen", "abyssinia", "cbebirr", "mpesa", "unknown"]
      return {
        transactionReference: String(parsed.transactionReference || ''),
        amount: parsed.amount ? String(parsed.amount) : undefined,
        senderName: parsed.senderName ? String(parsed.senderName) : undefined,
        senderAccount: parsed.senderAccount ? String(parsed.senderAccount) : undefined,
        receiverName: parsed.receiverName ? String(parsed.receiverName) : undefined,
        receiverAccount: parsed.receiverAccount ? String(parsed.receiverAccount) : undefined,
        date: parsed.date ? String(parsed.date) : undefined,
        time: parsed.time ? String(parsed.time) : undefined,
        paymentMethod: validMethods.includes(parsed.paymentMethod?.toLowerCase()) 
          ? parsed.paymentMethod.toLowerCase() 
          : 'unknown',
        bankName: parsed.bankName ? String(parsed.bankName) : undefined,
        transactionType: parsed.transactionType ? String(parsed.transactionType) : undefined,
        status: parsed.status ? String(parsed.status) : undefined,
        additionalNotes: parsed.additionalNotes ? String(parsed.additionalNotes) : undefined,
      }
    }
  } catch {
    // If JSON parsing fails, return empty data
  }
  
  return {
    transactionReference: '',
    paymentMethod: 'unknown',
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("screenshot") as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No screenshot provided" },
        { status: 400 }
      );
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { success: false, error: "Groq API key not configured" },
        { status: 500 }
      );
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const mimeType = file.type || "image/png";

    const { text } = await generateText({
      model: groq("llama-3.2-90b-vision-preview"),
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this Ethiopian payment screenshot and extract all transaction details.

This could be from CBE (Commercial Bank of Ethiopia), Telebirr, Dashen Bank, Bank of Abyssinia, CBE Birr, or M-Pesa.

Extract the following information and respond with ONLY a valid JSON object:

{
  "transactionReference": "<the transaction reference/receipt number - THIS IS MOST IMPORTANT>",
  "amount": "<transaction amount with ETB>",
  "senderName": "<name of sender/payer>",
  "senderAccount": "<sender account number or phone>",
  "receiverName": "<name of receiver/payee>",
  "receiverAccount": "<receiver account number or phone>",
  "date": "<transaction date>",
  "time": "<transaction time>",
  "paymentMethod": "<cbe | telebirr | dashen | abyssinia | cbebirr | mpesa | unknown>",
  "bankName": "<full bank/provider name>",
  "transactionType": "<transfer | payment | withdrawal | deposit | etc>",
  "status": "<success | pending | failed | etc>",
  "additionalNotes": "<any other relevant info>"
}

Be precise with the transaction reference number as it will be used for verification.
Respond with ONLY the JSON object, no other text:`,
            },
            {
              type: "image",
              image: `data:${mimeType};base64,${base64}`,
            },
          ],
        },
      ],
    });

    const extractedData = parseExtractedData(text);

    if (!extractedData.transactionReference) {
      return NextResponse.json({
        success: false,
        error: "Could not extract transaction reference from screenshot. Please enter manually.",
      });
    }

    return NextResponse.json({
      success: true,
      extractedData,
    });
  } catch (error) {
    console.error("Extraction error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to extract data from screenshot. Please try again or enter details manually." },
      { status: 500 }
    );
  }
}
