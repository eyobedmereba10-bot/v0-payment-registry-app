'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, XCircle, AlertTriangle, ShieldCheck, ShieldAlert, ShieldX } from 'lucide-react'
import type { VerificationResponse } from '@/lib/types'

interface AIAnalysisExtended {
  confidence: number
  riskLevel: 'low' | 'medium' | 'high'
  summary: string
  flags: string[]
  recommendation?: string
}

interface VerificationResultProps {
  data: VerificationResponse & { aiAnalysis?: AIAnalysisExtended }
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

  const getRecommendationStyle = (recommendation?: string) => {
    if (!recommendation) return { icon: AlertTriangle, bgColor: 'bg-muted', textColor: 'text-muted-foreground' }
    const upper = recommendation.toUpperCase()
    if (upper.startsWith('APPROVE')) {
      return { icon: ShieldCheck, bgColor: 'bg-green-50 dark:bg-green-950', textColor: 'text-green-700 dark:text-green-400', borderColor: 'border-green-200 dark:border-green-800' }
    }
    if (upper.startsWith('REJECT')) {
      return { icon: ShieldX, bgColor: 'bg-red-50 dark:bg-red-950', textColor: 'text-red-700 dark:text-red-400', borderColor: 'border-red-200 dark:border-red-800' }
    }
    return { icon: ShieldAlert, bgColor: 'bg-yellow-50 dark:bg-yellow-950', textColor: 'text-yellow-700 dark:text-yellow-400', borderColor: 'border-yellow-200 dark:border-yellow-800' }
  }

  const recStyle = getRecommendationStyle(data.aiAnalysis?.recommendation)
  const RecIcon = recStyle.icon

  return (
    <div className="flex flex-col gap-4">
      {/* AI Recommendation Banner */}
      {data.aiAnalysis?.recommendation && (
        <Card className={`border-2 ${recStyle.borderColor} ${recStyle.bgColor}`}>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <RecIcon className={`h-8 w-8 ${recStyle.textColor}`} />
              <div className="flex-1">
                <h3 className={`font-semibold text-lg ${recStyle.textColor}`}>
                  {data.aiAnalysis.recommendation.split(' - ')[0]}
                </h3>
                {data.aiAnalysis.recommendation.includes(' - ') && (
                  <p className={`text-sm ${recStyle.textColor} opacity-80`}>
                    {data.aiAnalysis.recommendation.split(' - ').slice(1).join(' - ')}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Verification Status */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              {data.success ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              Verification Status
            </CardTitle>
            <Badge variant={data.success ? 'default' : 'destructive'}>
              {data.success ? 'FOUND IN BANK SYSTEM' : 'NOT FOUND'}
            </Badge>
          </div>
          <CardDescription>
            {data.success
              ? 'Transaction was found and confirmed in the bank records'
              : data.error || data.message || 'Transaction could not be verified in the bank system'}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Transaction Details */}
      {data.success && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Transaction Details</CardTitle>
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
              {data.receiverName && (
                <div>
                  <dt className="text-muted-foreground">Receiver Name</dt>
                  <dd className="font-medium">{data.receiverName}</dd>
                </div>
              )}
              {data.receiverAccountNumber && (
                <div>
                  <dt className="text-muted-foreground">Receiver Account</dt>
                  <dd className="font-medium font-mono">{data.receiverAccountNumber}</dd>
                </div>
              )}
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
      )}

      {/* AI Analysis */}
      {data.aiAnalysis && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">AI Fraud Analysis</CardTitle>
              <Badge variant={getRiskBadgeVariant(data.aiAnalysis.riskLevel)}>
                {data.aiAnalysis.riskLevel?.toUpperCase()} RISK
              </Badge>
            </div>
            <CardDescription>
              Powered by Groq AI (Llama 3.3 70B)
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
              <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
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

            <div className="rounded-lg bg-muted/50 p-3">
              <h4 className="text-sm font-medium mb-1">Summary</h4>
              <p className="text-sm text-foreground">{data.aiAnalysis.summary}</p>
            </div>

            {data.aiAnalysis.flags && data.aiAnalysis.flags.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Observations</h4>
                <ul className="flex flex-col gap-2">
                  {data.aiAnalysis.flags.map((flag, index) => {
                    const isPositive = flag.toLowerCase().includes('confirmed') || 
                                       flag.toLowerCase().includes('verified') || 
                                       flag.toLowerCase().includes('match') ||
                                       flag.toLowerCase().includes('found')
                    const isNegative = flag.toLowerCase().includes('not found') ||
                                       flag.toLowerCase().includes('suspicious') ||
                                       flag.toLowerCase().includes('mismatch') ||
                                       flag.toLowerCase().includes('missing') ||
                                       flag.toLowerCase().includes('failed')
                    return (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        {isPositive ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                        ) : isNegative ? (
                          <XCircle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 shrink-0" />
                        )}
                        <span>{flag}</span>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
