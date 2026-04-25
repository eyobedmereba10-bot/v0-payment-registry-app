import { NextRequest, NextResponse } from 'next/server'
import { generateText } from 'ai'
import { createGroq } from '@ai-sdk/groq'

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
})

interface AnalysisResult {
  confidence: number
  riskLevel: 'low' | 'medium' | 'high'
  summary: string
  flags: string[]
  recommendation: string
  transactionDetails: {
    verifiedSender: string
    verifiedReceiver: string
    verifiedAmount: string
    verifiedDate: string
    verifiedReference: string
    verificationStatus: string
  }
}

function parseAnalysis(text: string, verificationResult: Record<string, unknown>): AnalysisResult {
  // Build transaction details from verification result - handle various data scenarios
  const senderName = verificationResult?.senderName as string
  const senderAccount = verificationResult?.senderAccountNumber as string
  const receiverName = verificationResult?.receiverName as string
  const receiverAccount = verificationResult?.receiverAccountNumber as string
  const amount = verificationResult?.transactionAmount as number
  const total = verificationResult?.total as number
  const narrative = verificationResult?.narrative as string
  const channel = verificationResult?.transactionChannel as string
  
  const transactionDetails = {
    verifiedSender: senderName 
      ? `${senderName}${senderAccount ? ` (${senderAccount})` : ''}`
      : senderAccount 
        ? `Account: ${senderAccount}` 
        : 'Not provided by bank',
    verifiedReceiver: receiverName 
      ? `${receiverName}${receiverAccount ? ` (${receiverAccount})` : ''}`
      : receiverAccount 
        ? `Account: ${receiverAccount}`
        : narrative 
          ? `Purpose: ${narrative}` 
          : 'Not provided by bank',
    verifiedAmount: amount 
      ? `${amount.toLocaleString()} ETB` 
      : total 
        ? `${total.toLocaleString()} ETB (total)` 
        : 'Not provided',
    verifiedDate: (verificationResult?.transactionDate as string) || 'Not provided',
    verifiedReference: (verificationResult?.transactionReference as string) || (verificationResult?.transferReference as string) || 'Not provided',
    verificationStatus: verificationResult?.success 
      ? `VERIFIED via ${channel || 'Bank API'}` 
      : 'NOT FOUND - Potentially fraudulent',
  }

  try {
    // Try to extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      return {
        confidence: Math.min(100, Math.max(0, Number(parsed.confidence) || 50)),
        riskLevel: ['low', 'medium', 'high'].includes(parsed.riskLevel) ? parsed.riskLevel : 'medium',
        summary: String(parsed.summary || 'Analysis completed'),
        flags: Array.isArray(parsed.flags) ? parsed.flags.map(String) : [],
        recommendation: String(parsed.recommendation || 'REVIEW - Manual verification recommended'),
        transactionDetails,
      }
    }
  } catch {
    // If JSON parsing fails, create a structured response from text
  }
  
  return {
    confidence: 50,
    riskLevel: 'medium',
    summary: text.slice(0, 500),
    flags: ['Unable to parse structured analysis'],
    recommendation: 'REVIEW - Manual verification recommended',
    transactionDetails,
  }
}

export async function POST(request: NextRequest) {
  try {
    const { verificationResult, extractedData } = await request.json()

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: 'Groq API key not configured' },
        { status: 500 }
      )
    }

    const isVerified = verificationResult?.success === true
    const hasAmount = verificationResult?.transactionAmount !== undefined
    const hasSender = verificationResult?.senderName !== undefined
    const hasReceiver = verificationResult?.receiverName !== undefined

    // Build comprehensive transaction context
    const transactionContext = `
===== BANK API VERIFICATION RESULT =====
Verification Status: ${isVerified ? '✓ SUCCESS - Transaction FOUND in official bank records' : '✗ FAILED - Transaction NOT FOUND in bank system'}
${verificationResult?.error ? `Error: ${verificationResult.error}` : ''}
${verificationResult?.message ? `Message: ${verificationResult.message}` : ''}

===== VERIFIED TRANSACTION DATA (from Bank API) =====
Sender Information:
  - Name: ${verificationResult?.senderName || 'NOT PROVIDED'}
  - Account Number: ${verificationResult?.senderAccountNumber || 'NOT PROVIDED'}

Receiver Information:
  - Name: ${verificationResult?.receiverName || 'NOT PROVIDED'}
  - Account Number: ${verificationResult?.receiverAccountNumber || 'NOT PROVIDED'}

Financial Details:
  - Transaction Amount: ${hasAmount ? `${verificationResult.transactionAmount} ETB` : 'NOT PROVIDED'}
  - Service Charge: ${verificationResult?.serviceCharge ? `${verificationResult.serviceCharge} ETB` : '0 ETB'}
  - Excise Tax: ${verificationResult?.exciseTax ? `${verificationResult.exciseTax} ETB` : '0 ETB'}
  - VAT: ${verificationResult?.vat ? `${verificationResult.vat} ETB` : '0 ETB'}
  - Total Amount: ${verificationResult?.total ? `${verificationResult.total} ETB` : 'NOT PROVIDED'}

Transaction Identifiers:
  - Transaction Reference: ${verificationResult?.transactionReference || 'NOT PROVIDED'}
  - Transfer Reference: ${verificationResult?.transferReference || 'NOT PROVIDED'}

Transaction Metadata:
  - Channel: ${verificationResult?.transactionChannel || 'NOT PROVIDED'}
  - Service Type: ${verificationResult?.serviceType || 'NOT PROVIDED'}
  - Date: ${verificationResult?.transactionDate || 'NOT PROVIDED'}
  - Narrative/Reason: ${verificationResult?.narrative || 'NOT PROVIDED'}

${extractedData ? `
===== SCREENSHOT/USER PROVIDED DATA =====
  - Reference Entered: ${extractedData.transactionReference || 'Not provided'}
  - Amount Claimed: ${extractedData.amount || 'Not provided'}
  - Sender Claimed: ${extractedData.senderName || 'Not provided'}
  - Receiver Claimed: ${extractedData.receiverName || 'Not provided'}
  - Date on Screenshot: ${extractedData.date || 'Not provided'}
  - Payment Method: ${extractedData.paymentMethod || 'Not specified'}
` : ''}
`

    const { text } = await generateText({
      model: groq('llama-3.3-70b-versatile'),
      prompt: `You are an expert Ethiopian payment fraud analyst. Your job is to analyze payment verification results and provide a clear, detailed assessment.

${transactionContext}

===== YOUR ANALYSIS TASK =====

Based on the data above, provide a comprehensive fraud risk assessment. Consider:

1. VERIFICATION STATUS: 
   - Did the bank API confirm this transaction exists? This is the most critical factor.
   - If NOT FOUND, this is a MAJOR red flag indicating potential fake receipt.

2. DATA COMPLETENESS:
   - Are sender and receiver names provided?
   - Is the amount clearly stated?
   - Are all identifiers present?

3. DATA CONSISTENCY (if screenshot data provided):
   - Does the screenshot data match the bank's verified data?
   - Any discrepancies in amounts, names, or references?

4. TRANSACTION CHARACTERISTICS:
   - Is the amount reasonable for the service type?
   - Is the channel appropriate (Mobile, Branch, etc.)?

YOU MUST RESPOND WITH ONLY A JSON OBJECT IN THIS EXACT FORMAT:
{
  "confidence": <number 0-100>,
  "riskLevel": "<low|medium|high>",
  "summary": "<Write a detailed 2-4 sentence summary that specifically mentions: 1) Whether the transaction was verified or not, 2) The sender and receiver names if available, 3) The exact amount, 4) Your risk assessment reason>",
  "flags": [
    "<Specific observation 1 - mention actual names/amounts/references>",
    "<Specific observation 2>",
    "<Specific observation 3>",
    "<Add more as needed>"
  ],
  "recommendation": "<APPROVE|REVIEW|REJECT> - <Specific reason mentioning the transaction details>"
}

IMPORTANT RULES FOR YOUR RESPONSE:
- If verification SUCCEEDED: confidence should be 70-100, riskLevel "low", recommendation starts with "APPROVE"
- If verification FAILED: confidence should be 0-30, riskLevel "high", recommendation starts with "REJECT"
- In your summary, ALWAYS mention specific data: sender name, receiver name, amount in ETB
- In flags, include specific observations like "Sender John Doe verified" not just "Sender verified"
- Be specific and include actual values from the transaction

RESPOND WITH ONLY THE JSON OBJECT, NO OTHER TEXT:`,
    })

    const analysis = parseAnalysis(text, verificationResult || {})
    return NextResponse.json(analysis)
  } catch (error) {
    console.error('AI analysis error:', error)
    return NextResponse.json({
      confidence: 0,
      riskLevel: 'high',
      summary: 'AI analysis service encountered an error. The transaction verification status is unknown and requires manual review.',
      flags: [
        'AI analysis service unavailable',
        'Automated fraud detection could not be performed',
        'Manual verification strongly recommended'
      ],
      recommendation: 'REVIEW - Unable to perform automated analysis due to system error',
      transactionDetails: {
        verifiedSender: 'Analysis unavailable',
        verifiedReceiver: 'Analysis unavailable',
        verifiedAmount: 'Analysis unavailable',
        verifiedDate: 'Analysis unavailable',
        verifiedReference: 'Analysis unavailable',
        verificationStatus: 'Error during analysis',
      },
    })
  }
}
