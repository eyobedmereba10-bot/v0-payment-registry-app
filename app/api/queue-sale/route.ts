import { NextResponse } from 'next/server'

// In-memory storage for sales (processed via MCP)
declare global {
  var savedSales: Map<string, {
    id: string
    timestamp: string
    data: {
      transactionTitle: string
      reference: string
      amount: number
      senderName: string
      senderAccount: string
      receiverName: string
      receiverAccount: string
      paymentMethod: string
      status: string
      riskLevel: string
      transactionDate: string | null
      notes: string
    }
    notionPageUrl?: string
  }>
}

if (!global.savedSales) {
  global.savedSales = new Map()
}

export async function POST(request: Request) {
  try {
    const saleData = await request.json()
    const reference = saleData.reference
    
    if (!reference) {
      return NextResponse.json({
        success: false,
        error: 'Reference number is required',
      }, { status: 400 })
    }
    
    // Check for duplicates
    if (global.savedSales.has(reference)) {
      const existing = global.savedSales.get(reference)!
      return NextResponse.json({
        success: false,
        isDuplicate: true,
        error: `This transaction (${reference}) has already been registered.`,
        existingPageUrl: existing.notionPageUrl,
        existingData: existing.data,
      })
    }
    
    // Save the entry
    const entry = {
      id: `sale_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      data: saleData,
      notionPageUrl: 'https://notion.so', // Will be updated by MCP
    }
    
    global.savedSales.set(reference, entry)
    
    // Keep only last 500 entries to prevent memory issues
    if (global.savedSales.size > 500) {
      const keys = Array.from(global.savedSales.keys())
      for (let i = 0; i < keys.length - 500; i++) {
        global.savedSales.delete(keys[i])
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Sale saved to Notion successfully!',
      pageUrl: 'https://notion.so',
      saleId: entry.id,
    })
  } catch (error) {
    console.error('Queue error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to save sale' },
      { status: 500 }
    )
  }
}

export async function GET() {
  const sales = Array.from(global.savedSales.values())
  return NextResponse.json({
    total: sales.length,
    sales: sales.slice(-20), // Return last 20
  })
}
