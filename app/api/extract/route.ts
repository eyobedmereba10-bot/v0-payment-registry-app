import { createGroq } from "@ai-sdk/groq";
import { generateText } from "ai";
import { NextRequest, NextResponse } from "next/server";

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

interface ExtractedData {
  transactionReference: string;
  amount?: string;
  senderName?: string;
  senderAccount?: string;
  receiverName?: string;
  receiverAccount?: string;
  date?: string;
  time?: string;
  paymentMethod:
    | "cbe"
    | "telebirr"
    | "dashen"
    | "abyssinia"
    | "cbebirr"
    | "mpesa"
    | "unknown";
  bankName?: string;
  transactionType?: string;
  status?: string;
  additionalNotes?: string;
}

function parseExtractedData(text: string): ExtractedData {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      const validMethods = [
        "cbe",
        "telebirr",
        "dashen",
        "abyssinia",
        "cbebirr",
        "mpesa",
        "unknown",
      ];
      return {
        transactionReference: String(parsed.transactionReference || ""),
        amount: parsed.amount ? String(parsed.amount) : undefined,
        senderName: parsed.senderName ? String(parsed.senderName) : undefined,
        senderAccount: parsed.senderAccount
          ? String(parsed.senderAccount)
          : undefined,
        receiverName: parsed.receiverName
          ? String(parsed.receiverName)
          : undefined,
        receiverAccount: parsed.receiverAccount
          ? String(parsed.receiverAccount)
          : undefined,
        date: parsed.date ? String(parsed.date) : undefined,
        time: parsed.time ? String(parsed.time) : undefined,
        paymentMethod: validMethods.includes(parsed.paymentMethod?.toLowerCase())
          ? parsed.paymentMethod.toLowerCase()
          : "unknown",
        bankName: parsed.bankName ? String(parsed.bankName) : undefined,
        transactionType: parsed.transactionType
          ? String(parsed.transactionType)
          : undefined,
        status: parsed.status ? String(parsed.status) : undefined,
        additionalNotes: parsed.additionalNotes
          ? String(parsed.additionalNotes)
          : undefined,
      };
    }
  } catch {
    // If JSON parsing fails, return empty data
  }

  return {
    transactionReference: "",
    paymentMethod: "unknown",
  };
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
    const dataUrl = `data:${mimeType};base64,${base64}`;

    const { text } = await generateText({
      model: groq("llama-3.2-90b-vision-preview"),
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `You are an expert at reading Ethiopian payment screenshots from CBE, Telebirr, Dashen Bank, Bank of Abyssinia, CBE Birr, and M-Pesa.

Carefully analyze this payment screenshot and extract ALL visible transaction details.

IMPORTANT: The transaction reference number is CRITICAL - look for labels like:
- "Transaction ID", "Reference", "Receipt No", "Ref No", "TXN ID", "Transaction Number"
- It's usually a long alphanumeric code

Also extract:
- Amount (look for ETB, Birr, or just numbers)
- Sender name and account/phone
- Receiver name and account/phone  
- Date and time
- Payment provider (CBE, Telebirr, Dashen, Abyssinia, CBE Birr, M-Pesa)
- Transaction status (Success, Completed, Pending, etc.)

Respond with ONLY this JSON format, no other text:
{
  "transactionReference": "<the transaction ID/reference - MOST IMPORTANT>",
  "amount": "<amount with ETB>",
  "senderName": "<sender full name>",
  "senderAccount": "<sender account or phone>",
  "receiverName": "<receiver full name>",
  "receiverAccount": "<receiver account or phone>",
  "date": "<date>",
  "time": "<time>",
  "paymentMethod": "<cbe | telebirr | dashen | abyssinia | cbebirr | mpesa | unknown>",
  "bankName": "<full provider name>",
  "transactionType": "<transfer | payment | deposit | withdrawal>",
  "status": "<success | pending | failed>",
  "additionalNotes": "<any other details>"
}`,
            },
            {
              type: "image",
              image: dataUrl,
            },
          ],
        },
      ],
      maxTokens: 1000,
    });

    console.log("[v0] Groq vision response:", text);

    const extractedData = parseExtractedData(text);

    if (!extractedData.transactionReference) {
      return NextResponse.json({
        success: false,
        error:
          "Could not find transaction reference in screenshot. Please ensure the full receipt is visible and try again.",
        rawResponse: text,
      });
    }

    return NextResponse.json({
      success: true,
      extractedData,
    });
  } catch (error) {
    console.error("[v0] Extraction error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        success: false,
        error: `Failed to process screenshot: ${errorMessage}`,
      },
      { status: 500 }
    );
  }
}
