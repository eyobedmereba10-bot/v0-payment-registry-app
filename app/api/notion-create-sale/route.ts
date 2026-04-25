import { NextRequest, NextResponse } from 'next/server'

// This endpoint prepares the data for Notion page creation
// The actual MCP call will be made from the client side
export async function POST(request: NextRequest) {
  try {
    const { dataSourceId, properties } = await request.json()
    
    if (!dataSourceId || !properties) {
      return NextResponse.json(
        { success: false, error: 'Missing dataSourceId or properties' },
        { status: 400 }
      )
    }

    // Return the prepared data for the frontend to use with Notion MCP
    // The frontend will call the Notion MCP tool to create the page
    return NextResponse.json({
      success: true,
      dataSourceId,
      properties,
      message: 'Data prepared for Notion. Use the Notion MCP to create the page.',
      // Provide a direct link to the database
      pageUrl: `https://www.notion.so/${dataSourceId.replace(/-/g, '')}`
    })
    
  } catch (error) {
    console.error('Error preparing Notion data:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to prepare Notion data' },
      { status: 500 }
    )
  }
}
