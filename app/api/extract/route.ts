import { createGroq } from "@ai-sdk/groq";
import { generateObject } from "ai";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

const extractionSchema = z.object({
  transactionReference: z.string().describe("The transaction reference number, receipt number, or transaction ID"),
  amount: z.string().optional().describe("The transaction amount with currency"),
  senderName: z.string().optional().describe("Name of the sender/payer"),
  senderAccount: z.string().optional().describe("Sender account number or phone number"),
  receiverName: z.string().optional().describe("Name of the receiver/payee"),
  receiverAccount: z.string().optional().describe("Receiver account number or phone number"),
  date: z.string().optional().describe("Transaction date"),
  time: z.string().optional().describe("Transaction time"),
  paymentMethod: z.enum(["cbe", "telebirr", "dashen", "abyssinia", "cbebirr", "mpesa", "unknown"]).describe("The payment provider detected from the screenshot"),
  bankName: z.string().optional().describe("Full name of the bank or payment provider"),
  transactionType: z.string().optional().describe("Type of transaction (transfer, payment, withdrawal, etc.)"),
  status: z.string().optional().describe("Transaction status if visible"),
  additionalNotes: z.string().optional().describe("Any other relevant information from the screenshot"),
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("screenshot") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No screenshot provided" },
        { status: 400 }
      );
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const mimeType = file.type || "image/png";

    const { object } = await generateObject({
      model: groq("llama-3.2-90b-vision-preview"),
      schema: extractionSchema,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this Ethiopian payment screenshot and extract all transaction details. 
              
This could be from CBE (Commercial Bank of Ethiopia), Telebirr, Dashen Bank, Bank of Abyssinia, CBE Birr, or M-Pesa.

Extract:
- Transaction reference/receipt number (most important)
- Amount
- Sender and receiver details
- Date and time
- Payment provider/bank
- Transaction status

Be precise with the transaction reference number as it will be used for verification.`,
            },
            {
              type: "image",
              image: `data:${mimeType};base64,${base64}`,
            },
          ],
        },
      ],
    });

    return NextResponse.json({
      success: true,
      extractedData: object,
    });
  } catch (error) {
    console.error("Extraction error:", error);
    return NextResponse.json(
      { error: "Failed to extract data from screenshot" },
      { status: 500 }
    );
  }
}
