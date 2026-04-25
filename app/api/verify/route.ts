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

    const data = await response.json()

    // Map the API response to our expected format
    const verificationResponse: VerificationResponse = {
      success: data.success ?? false,
      senderName: data.senderName,
      senderAccountNumber: data.senderAccountNumber,
      receiverName: data.receiverName,
      receiverAccountNumber: data.receiverAccountNumber,
      transactionChannel: data.transactionChannel,
      serviceType: data.serviceType,
      narrative: data.narrative,
      transactionReference: data.transactionReference,
      transferReference: data.transferReference,
      transactionAmount: data.transactionAmount,
      serviceCharge: data.serviceCharge,
      exciseTax: data.exciseTax,
      vat: data.vat,
      total: data.total,
      transactionDate: data.transactionDate,
      error: data.error,
      message: data.message,
    }

    return NextResponse.json(verificationResponse)
  } catch (error) {
    console.error('Verification error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to verify transaction' },
      { status: 500 }
    )
  }
}
