import { NextRequest, NextResponse } from 'next/server'
import { generateObject } from 'ai'
import { createGroq } from '@ai-sdk/groq'
import { z } from 'zod'
import type { VerificationResponse } from '@/lib/types'

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
})

const analysisSchema = z.object({
  confidence: z.number().min(0).max(100).describe('Confidence score from 0-100'),
  riskLevel: z.enum(['low', 'medium', 'high']).describe('Risk assessment level'),
  summary: z.string().describe('Brief summary of the transaction analysis'),
  flags: z.array(z.string()).describe('Any suspicious patterns or notable observations'),
})

export async function POST(request: NextRequest) {
  try {
    const transactionData: VerificationResponse = await request.json()

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: 'Groq API key not configured' },
        { status: 500 }
      )
    }

    const { object: analysis } = await generateObject({
      model: groq('llama-3.3-70b-versatile'),
      schema: analysisSchema,
      prompt: `Analyze this Ethiopian payment transaction for potential fraud or suspicious patterns:

Transaction Details:
- Sender Name: ${transactionData.senderName || 'Unknown'}
- Sender Account: ${transactionData.senderAccountNumber || 'Unknown'}
- Amount: ${transactionData.transactionAmount || 0} ETB
- Total with fees: ${transactionData.total || 0} ETB
- Service Charge: ${transactionData.serviceCharge || 0} ETB
- Transaction Channel: ${transactionData.transactionChannel || 'Unknown'}
- Service Type: ${transactionData.serviceType || 'Unknown'}
- Reference: ${transactionData.transactionReference || 'Unknown'}
- Narrative: ${transactionData.narrative || 'None'}

Provide a fraud risk analysis with:
1. A confidence score (0-100) indicating how likely this is a legitimate transaction
2. A risk level (low, medium, high)
3. A brief summary of your analysis
4. Any red flags or suspicious patterns observed

Consider factors like:
- Transaction amount patterns
- Account number masking
- Service charges alignment
- Channel consistency
- Narrative content`,
    })

    return NextResponse.json(analysis)
  } catch (error) {
    console.error('AI analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze transaction' },
      { status: 500 }
    )
  }
}
