'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { VerificationResponse, AIAnalysis } from '@/lib/types'

interface TransactionHistoryProps {
  transactions: Array<VerificationResponse & { aiAnalysis?: AIAnalysis; timestamp: string }>
}

export function TransactionHistory({ transactions }: TransactionHistoryProps) {
  const formatCurrency = (amount?: number) => {
    if (amount === undefined || amount === null) return '-'
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
    }).format(amount)
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (transactions.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recent Verifications</CardTitle>
        <CardDescription>
          Your verification history for this session
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          {transactions.map((tx, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-lg border bg-card"
            >
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm">
                    {tx.transactionReference || tx.transferReference || 'Unknown'}
                  </span>
                  <Badge variant={tx.success ? 'default' : 'destructive'} className="text-xs">
                    {tx.success ? 'Verified' : 'Failed'}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{tx.senderName || 'Unknown sender'}</span>
                  <span>-</span>
                  <span>{formatTime(tx.timestamp)}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium">{formatCurrency(tx.transactionAmount)}</div>
                {tx.aiAnalysis && (
                  <div className="text-xs text-muted-foreground">
                    {tx.aiAnalysis.confidence}% confidence
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
