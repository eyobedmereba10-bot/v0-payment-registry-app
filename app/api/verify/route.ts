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
    
    // The API returns data nested inside a "data" object
    const apiData = rawData.data || rawData
    
    // Helper to safely parse numbers - handles "5.00 Birr" format
    const parseAmount = (val: unknown): number => {
      if (val === null || val === undefined || val === '') return 0
      if (typeof val === 'number') return val
      // Remove "Birr" suffix and parse
      const cleaned = String(val).replace(/[^\d.]/g, '')
      const num = parseFloat(cleaned)
      return isNaN(num) ? 0 : num
    }

    // Map the API response - handle different field names from different providers
    // Telebirr uses: payerName, payerTelebirrNo, creditedPartyName, creditedPartyAccountNo, receiptNo, settledAmount, totalPaidAmount
    // Dashen uses: senderName, senderAccountNumber, transactionAmount, transactionReference, etc.
    const verificationResponse: VerificationResponse = {
      success: rawData.success === true,
      // Sender info - try multiple field names
      senderName: apiData.senderName || apiData.payerName || apiData.fromName || null,
      senderAccountNumber: apiData.senderAccountNumber || apiData.payerTelebirrNo || apiData.payerAccountNo || apiData.fromAccount || null,
      // Receiver info
      receiverName: apiData.receiverName || apiData.creditedPartyName || apiData.beneficiaryName || apiData.toName || null,
      receiverAccountNumber: apiData.receiverAccountNumber || apiData.creditedPartyAccountNo || apiData.beneficiaryAccount || apiData.toAccount || null,
      // Transaction details
      transactionChannel: apiData.transactionChannel || apiData.channel || apiData.bankName || null,
      serviceType: apiData.serviceType || apiData.transactionStatus || apiData.type || null,
      narrative: apiData.narrative || apiData.description || apiData.remark || null,
      transactionReference: apiData.transactionReference || apiData.receiptNo || apiData.reference || apiData.txnRef || null,
      transferReference: apiData.transferReference || apiData.ftRef || null,
      // Amounts - parse from strings like "5.00 Birr"
      transactionAmount: parseAmount(apiData.transactionAmount) || parseAmount(apiData.settledAmount) || parseAmount(apiData.amount) || 0,
      serviceCharge: parseAmount(apiData.serviceCharge) || parseAmount(apiData.serviceFee) || parseAmount(apiData.fee) || 0,
      exciseTax: parseAmount(apiData.exciseTax) || 0,
      vat: parseAmount(apiData.vat) || parseAmount(apiData.serviceFeeVAT) || 0,
      total: parseAmount(apiData.total) || parseAmount(apiData.totalPaidAmount) || parseAmount(apiData.totalAmount) || 0,
      // Date
      transactionDate: apiData.transactionDate || apiData.paymentDate || apiData.date || null,
      error: rawData.error || null,
      message: rawData.message || null,
    }

    // If total is 0 but transactionAmount exists, use that as total
    if (verificationResponse.total === 0 && verificationResponse.transactionAmount > 0) {
      verificationResponse.total = verificationResponse.transactionAmount
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
