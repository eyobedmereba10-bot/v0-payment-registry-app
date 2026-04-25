import { NextRequest, NextResponse } from 'next/server'

// Notion data source ID for Sales Transactions database
const NOTION_DATA_SOURCE_ID = '46dff2e8-4988-4136-a1a5-13009bc04fdc'

interface SaleData {
  transactionTitle: string
  reference: string
  amount: number
  senderName: string
  senderAccount: string
  receiverName: string
  receiverAccount: string
  paymentMethod: string
  status: 'Verified' | 'Failed' | 'Pending'
  riskLevel: 'Low' | 'Medium' | 'High'
  transactionDate: string | null
  notes: string
}

export async function POST(request: NextRequest) {
  try {
    const saleData: SaleData = await request.json()
    
    // Map payment method to Notion select options
    const paymentMethodMap: Record<string, string> = {
      'telebirr': 'Telebirr',
      'cbe': 'CBE',
      'dashen': 'Dashen',
      'abyssinia': 'Abyssinia',
      'cbebirr': 'CBE Birr',
      'mpesa': 'M-Pesa',
    }
    
    const notionPaymentMethod = paymentMethodMap[saleData.paymentMethod?.toLowerCase()] || 'Unknown'
    
    // Build properties for Notion page
    const properties: Record<string, string | number | null> = {
      'Transaction': saleData.transactionTitle || `Sale - ${saleData.reference}`,
      'Reference': saleData.reference || '',
      'Amount': saleData.amount || 0,
      'Sender': saleData.senderName || '',
      'Sender Account': saleData.senderAccount || '',
      'Receiver': saleData.receiverName || '',
      'Receiver Account': saleData.receiverAccount || '',
      'Payment Method': notionPaymentMethod,
      'Status': saleData.status || 'Verified',
      'Risk Level': saleData.riskLevel || 'Low',
      'Notes': saleData.notes || '',
    }
    
    // Add transaction date if available
    if (saleData.transactionDate) {
      // Parse date from various formats like "25-04-2026 07:16:13"
      let dateStr = saleData.transactionDate
      
      // Try to convert DD-MM-YYYY to YYYY-MM-DD
      const ddmmyyyy = dateStr.match(/^(\d{2})-(\d{2})-(\d{4})/)
      if (ddmmyyyy) {
        dateStr = `${ddmmyyyy[3]}-${ddmmyyyy[2]}-${ddmmyyyy[1]}`
      }
      
      properties['date:Transaction Date:start'] = dateStr.split(' ')[0] // Just the date part
      properties['date:Transaction Date:is_datetime'] = 0
    }
    
    // Return the data source ID and properties for the frontend to use with Notion MCP
    return NextResponse.json({
      success: true,
      dataSourceId: NOTION_DATA_SOURCE_ID,
      properties,
      message: 'Sale data prepared for Notion registration'
    })
    
  } catch (error) {
    console.error('Error preparing sale data:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to prepare sale data' },
      { status: 500 }
    )
  }
}
