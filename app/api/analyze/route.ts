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
}

function parseAnalysis(text: string): AnalysisResult {
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

    const transactionContext = `
VERIFICATION API RESULT:
- API Success: ${isVerified ? 'YES - Transaction found in bank system' : 'NO - Transaction NOT found or verification failed'}
- Error Message: ${verificationResult?.error || verificationResult?.message || 'None'}

TRANSACTION DETAILS FROM BANK API:
- Sender Name: ${verificationResult?.senderName || 'Not provided'}
- Sender Account: ${verificationResult?.senderAccountNumber || 'Not provided'}
- Receiver Name: ${verificationResult?.receiverName || 'Not provided'}
- Receiver Account: ${verificationResult?.receiverAccountNumber || 'Not provided'}
- Transaction Amount: ${verificationResult?.transactionAmount ? `${verificationResult.transactionAmount} ETB` : 'Not provided'}
- Total (with fees): ${verificationResult?.total ? `${verificationResult.total} ETB` : 'Not provided'}
- Service Charge: ${verificationResult?.serviceCharge || 0} ETB
- Transaction Reference: ${verificationResult?.transactionReference || 'Not provided'}
- Transfer Reference: ${verificationResult?.transferReference || 'Not provided'}
- Transaction Channel: ${verificationResult?.transactionChannel || 'Not provided'}
- Service Type: ${verificationResult?.serviceType || 'Not provided'}
- Narrative/Reason: ${verificationResult?.narrative || 'Not provided'}
- Transaction Date: ${verificationResult?.transactionDate || 'Not provided'}

${extractedData ? `
DATA EXTRACTED FROM SCREENSHOT (if uploaded):
- Reference from image: ${extractedData.transactionReference || 'Not extracted'}
- Amount from image: ${extractedData.amount || 'Not extracted'}
- Sender from image: ${extractedData.senderName || 'Not extracted'}
- Receiver from image: ${extractedData.receiverName || 'Not extracted'}
- Date from image: ${extractedData.date || 'Not extracted'}
- Payment Method detected: ${extractedData.paymentMethod || 'Not detected'}
` : ''}
`

    const { text } = await generateText({
      model: groq('llama-3.3-70b-versatile'),
      prompt: `You are an Ethiopian payment fraud detection expert. Analyze this payment verification result and provide your assessment as a JSON object.

${transactionContext}

CRITICAL ANALYSIS RULES:
1. If "API Success" is NO, the transaction was NOT found in the bank's system - this is a MAJOR RED FLAG indicating potential fraud
2. If "API Success" is YES, the transaction exists in official bank records - this is a strong positive indicator
3. Compare screenshot data with API data - mismatches indicate potential fraud
4. Check if amounts, names, and references are consistent
5. Look for suspicious patterns: unusual amounts, masked account numbers, missing fields

You MUST respond with ONLY a valid JSON object in this exact format:
{
  "confidence": <number 0-100, where 100 means definitely legitimate, 0 means definitely fraudulent>,
  "riskLevel": "<low | medium | high>",
  "summary": "<2-3 sentence summary explaining verification result>",
  "flags": ["<observation 1>", "<observation 2>", ...],
  "recommendation": "<APPROVE | REVIEW | REJECT> - <brief reason>"
}

Remember:
- If API Success is NO, confidence should be LOW (0-30) and riskLevel should be "high"
- If API Success is YES, confidence should be HIGH (70-100) and riskLevel should be "low"
- Be specific in your flags about what you observed

Respond with ONLY the JSON object, no other text:`,
    })

    const analysis = parseAnalysis(text)
    return NextResponse.json(analysis)
  } catch (error) {
    console.error('AI analysis error:', error)
    return NextResponse.json({
      confidence: 0,
      riskLevel: 'high',
      summary: 'AI analysis service encountered an error. Manual review is required to verify this transaction.',
      flags: ['AI analysis service error', 'Automated verification unavailable'],
      recommendation: 'REVIEW - Unable to perform automated analysis, please verify manually',
    })
  }
}
