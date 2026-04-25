import { NextRequest, NextResponse } from 'next/server'

const NOTION_API_URL = 'https://api.notion.com/v1'

// Check if a reference number already exists in the database
async function checkDuplicateReference(
  databaseId: string, 
  reference: string, 
  notionApiKey: string
): Promise<{ exists: boolean; pageUrl?: string }> {
  if (!reference) return { exists: false }
  
  try {
    const response = await fetch(`${NOTION_API_URL}/databases/${databaseId}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${notionApiKey}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
      },
      body: JSON.stringify({
        filter: {
          property: 'Reference',
          rich_text: {
            equals: reference
          }
        },
        page_size: 1
      }),
    })

    const result = await response.json()
    
    if (result.results && result.results.length > 0) {
      const existingPage = result.results[0]
      const pageUrl = existingPage.url || `https://notion.so/${existingPage.id?.replace(/-/g, '')}`
      return { exists: true, pageUrl }
    }
    
    return { exists: false }
  } catch (error) {
    console.error('Error checking for duplicate:', error)
    return { exists: false }
  }
}

export async function POST(request: NextRequest) {
  try {
    const { 
      transactionTitle,
      reference,
      amount,
      senderName,
      senderAccount,
      receiverName,
      receiverAccount,
      paymentMethod,
      status,
      riskLevel,
      transactionDate,
      notes,
    } = await request.json()

    const notionApiKey = process.env.NOTION_API_KEY
    const databaseId = process.env.NOTION_DATABASE_ID

    if (!notionApiKey) {
      return NextResponse.json(
        { success: false, error: 'Notion API key not configured. Please add NOTION_API_KEY in Settings > Vars.' },
        { status: 500 }
      )
    }

    if (!databaseId) {
      return NextResponse.json(
        { success: false, error: 'Notion database ID not configured. Please add NOTION_DATABASE_ID in Settings > Vars.' },
        { status: 500 }
      )
    }

    // Check for duplicate reference number
    if (reference) {
      const duplicateCheck = await checkDuplicateReference(databaseId, reference, notionApiKey)
      
      if (duplicateCheck.exists) {
        return NextResponse.json({
          success: false,
          isDuplicate: true,
          error: `This transaction (${reference}) is already registered in your database.`,
          existingPageUrl: duplicateCheck.pageUrl,
        }, { status: 409 })
      }
    }

    // Map payment method to Notion select options
    const paymentMethodMap: Record<string, string> = {
      'Telebirr': 'Telebirr',
      'telebirr': 'Telebirr',
      'CBE': 'CBE',
      'cbe': 'CBE',
      'Dashen': 'Dashen',
      'dashen': 'Dashen',
      'Abyssinia': 'Abyssinia',
      'abyssinia': 'Abyssinia',
      'CBE Birr': 'CBE Birr',
      'cbebirr': 'CBE Birr',
      'M-Pesa': 'M-Pesa',
      'mpesa': 'M-Pesa',
    }

    const mappedPaymentMethod = paymentMethodMap[paymentMethod] || 'Unknown'

    // Build Notion page properties
    const properties: Record<string, unknown> = {
      'Transaction': {
        title: [{ text: { content: transactionTitle || 'Unknown Transaction' } }]
      },
      'Reference': {
        rich_text: [{ text: { content: reference || '' } }]
      },
      'Amount': {
        number: typeof amount === 'number' ? amount : parseFloat(amount) || 0
      },
      'Sender': {
        rich_text: [{ text: { content: senderName || '' } }]
      },
      'Sender Account': {
        rich_text: [{ text: { content: senderAccount || '' } }]
      },
      'Receiver': {
        rich_text: [{ text: { content: receiverName || '' } }]
      },
      'Receiver Account': {
        rich_text: [{ text: { content: receiverAccount || '' } }]
      },
      'Payment Method': {
        select: { name: mappedPaymentMethod }
      },
      'Status': {
        select: { name: status === 'Verified' ? 'Verified' : status === 'Failed' ? 'Failed' : 'Pending' }
      },
      'Risk Level': {
        select: { name: riskLevel === 'High' ? 'High' : riskLevel === 'Medium' ? 'Medium' : 'Low' }
      },
      'Notes': {
        rich_text: [{ text: { content: notes || '' } }]
      },
    }

    // Add transaction date if provided
    if (transactionDate) {
      let dateStr = transactionDate
      if (transactionDate.includes('-') && transactionDate.includes(':')) {
        const parts = transactionDate.split(' ')[0].split('-')
        if (parts.length === 3 && parts[0].length === 2) {
          dateStr = `${parts[2]}-${parts[1]}-${parts[0]}`
        }
      }
      properties['Transaction Date'] = { date: { start: dateStr } }
    }

    // Create the page in Notion
    const response = await fetch(`${NOTION_API_URL}/pages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${notionApiKey}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
      },
      body: JSON.stringify({
        parent: { database_id: databaseId },
        properties,
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      // Provide helpful error message
      if (result.code === 'object_not_found') {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Database not found. Make sure your Notion database is shared with your integration. Go to your database in Notion, click Share, and add your integration.' 
          },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { success: false, error: result.message || 'Failed to create Notion page' },
        { status: response.status }
      )
    }

    const pageUrl = result.url || `https://notion.so/${result.id?.replace(/-/g, '')}`

    return NextResponse.json({
      success: true,
      pageId: result.id,
      pageUrl,
      message: 'Sale registered successfully!',
    })

  } catch (error) {
    console.error('Error creating Notion page:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create sale in Notion' },
      { status: 500 }
    )
  }
}
