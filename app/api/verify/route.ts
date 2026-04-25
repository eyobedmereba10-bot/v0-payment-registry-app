import { NextRequest, NextResponse } from 'next/server'
import type { VerificationRequest, VerificationResponse, PaymentProvider } from '@/lib/types'

const API_BASE_URL = 'https://verifyapi.leulzenebe.pro'

const PROVIDER_ENDPOINTS: Record<PaymentProvider, string> = {
  universal: '/verify',
  cbe: '/verify-cbe',
  telebirr: '/verify-telebirr',
  dashen: '/verify-dashen',
  abyssinia: '/verify-abyssinia',
  cbebirr: '/verify-cbebirr',
  mpesa: '/verify-mpesa',
}

export async function POST(request: NextRequest) {
  try {
    const body: VerificationRequest = await request.json()
    const { reference, suffix, phoneNumber, provider } = body

    if (!reference) {
      return NextResponse.json(
        { success: false, error: 'Reference number is required' },
        { status: 400 }
      )
    }

    const apiKey = process.env.VERIFY_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'API key not configured' },
        { status: 500 }
      )
    }

    const endpoint = PROVIDER_ENDPOINTS[provider] || '/verify'
    
    // Build request body based on provider requirements
    const requestBody: Record<string, string> = { reference }
    
    if (suffix && ['cbe', 'abyssinia', 'universal'].includes(provider)) {
      requestBody.suffix = suffix
    }
    
    if (phoneNumber && ['cbebirr', 'mpesa'].includes(provider)) {
      requestBody.phoneNumber = phoneNumber
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify(requestBody),
    })

    const rawData = await response.json()
    
    // Log the raw response for debugging
    console.log('[v0] Raw API response:', JSON.stringify(rawData, null, 2))
    
    // The API returns data directly (not nested)
    const data = rawData

    // Helper to safely parse numbers
    const parseNum = (val: unknown): number => {
      if (val === null || val === undefined) return 0
      const num = typeof val === 'number' ? val : parseFloat(String(val))
      return isNaN(num) ? 0 : num
    }

    // Map the API response - use the exact field names from the API documentation
    const verificationResponse: VerificationResponse = {
      success: data.success === true,
      senderName: data.senderName ?? null,
      senderAccountNumber: data.senderAccountNumber ?? null,
      receiverName: data.receiverName ?? null,
      receiverAccountNumber: data.receiverAccountNumber ?? null,
      transactionChannel: data.transactionChannel ?? null,
      serviceType: data.serviceType ?? null,
      narrative: data.narrative ?? null,
      transactionReference: data.transactionReference ?? null,
      transferReference: data.transferReference ?? null,
      transactionAmount: parseNum(data.transactionAmount),
      serviceCharge: parseNum(data.serviceCharge),
      exciseTax: parseNum(data.exciseTax),
      vat: parseNum(data.vat),
      total: parseNum(data.total),
      transactionDate: data.transactionDate ?? null,
      error: data.error ?? null,
      message: data.message ?? null,
    }
    
    console.log('[v0] Mapped response:', JSON.stringify(verificationResponse, null, 2))

    return NextResponse.json(verificationResponse)
  } catch (error) {
    console.error('Verification error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to verify transaction' },
      { status: 500 }
    )
  }
}
