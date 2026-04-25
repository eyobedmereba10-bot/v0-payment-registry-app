'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { VerificationResponse, AIAnalysis } from '@/lib/types'

interface VerificationResultProps {
  data: VerificationResponse & { aiAnalysis?: AIAnalysis }
}

export function VerificationResult({ data }: VerificationResultProps) {
  const formatCurrency = (amount?: number) => {
    if (amount === undefined || amount === null) return '-'
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
    }).format(amount)
  }

  const getRiskBadgeVariant = (level?: string) => {
    switch (level) {
      case 'low':
        return 'default'
      case 'medium':
        return 'secondary'
      case 'high':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  const getConfidenceColor = (confidence?: number) => {
    if (!confidence) return 'text-muted-foreground'
    if (confidence >= 80) return 'text-green-600'
    if (confidence >= 50) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Transaction Details */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Transaction Details</CardTitle>
            <Badge variant={data.success ? 'default' : 'destructive'}>
              {data.success ? 'Verified' : 'Failed'}
            </Badge>
          </div>
          <CardDescription>
            Reference: {data.transactionReference || data.transferReference || '-'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-muted-foreground">Sender Name</dt>
              <dd className="font-medium">{data.senderName || '-'}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Account Number</dt>
              <dd className="font-medium font-mono">{data.senderAccountNumber || '-'}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Amount</dt>
              <dd className="font-medium text-lg">{formatCurrency(data.transactionAmount)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Total</dt>
              <dd className="font-medium text-lg">{formatCurrency(data.total)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Service Charge</dt>
              <dd className="font-medium">{formatCurrency(data.serviceCharge)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Channel</dt>
              <dd className="font-medium">{data.transactionChannel || '-'}</dd>
            </div>
            <div className="col-span-2">
              <dt className="text-muted-foreground">Service Type</dt>
              <dd className="font-medium">{data.serviceType || '-'}</dd>
            </div>
            {data.narrative && (
              <div className="col-span-2">
                <dt className="text-muted-foreground">Narrative</dt>
                <dd className="font-medium">{data.narrative}</dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      {/* AI Analysis */}
      {data.aiAnalysis && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">AI Analysis</CardTitle>
              <Badge variant={getRiskBadgeVariant(data.aiAnalysis.riskLevel)}>
                {data.aiAnalysis.riskLevel?.toUpperCase()} RISK
              </Badge>
            </div>
            <CardDescription>
              Powered by Groq AI
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">Confidence Score</span>
                <span className={`text-2xl font-bold ${getConfidenceColor(data.aiAnalysis.confidence)}`}>
                  {data.aiAnalysis.confidence}%
                </span>
              </div>
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    data.aiAnalysis.confidence >= 80
                      ? 'bg-green-500'
                      : data.aiAnalysis.confidence >= 50
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                  }`}
                  style={{ width: `${data.aiAnalysis.confidence}%` }}
                />
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Summary</h4>
              <p className="text-sm">{data.aiAnalysis.summary}</p>
            </div>

            {data.aiAnalysis.flags && data.aiAnalysis.flags.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Observations</h4>
                <ul className="flex flex-col gap-1">
                  {data.aiAnalysis.flags.map((flag, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <span className="text-muted-foreground">-</span>
                      <span>{flag}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
