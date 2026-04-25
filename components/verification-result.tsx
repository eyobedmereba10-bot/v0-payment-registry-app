'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  AlertCircle,
  ShieldCheck, 
  ShieldAlert, 
  ShieldX,
  User,
  ArrowRight,
  Banknote,
  Calendar,
  CreditCard,
  FileText,
  Building2,
  Hash,
  Clock,
  BookOpen,
  ExternalLink
} from 'lucide-react'
import type { VerificationResponse, AIAnalysis } from '@/lib/types'

interface VerificationResultProps {
  data: VerificationResponse & { aiAnalysis?: AIAnalysis }
  onRegisterToNotion?: () => Promise<{ 
    success: boolean; 
    pageUrl?: string; 
    error?: string;
    isDuplicate?: boolean;
    existingPageUrl?: string;
  }>
}

export function VerificationResult({ data, onRegisterToNotion }: VerificationResultProps) {
  const [isRegistering, setIsRegistering] = useState(false)
  const [registrationResult, setRegistrationResult] = useState<{ 
    success: boolean; 
    pageUrl?: string; 
    error?: string;
    isDuplicate?: boolean;
    existingPageUrl?: string;
  } | null>(null)
  const formatCurrency = (amount?: number | null) => {
    if (amount === undefined || amount === null || amount === 0) return 'ETB 0.00'
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 2,
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
    if (confidence >= 70) return 'text-green-600'
    if (confidence >= 40) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getRecommendationStyle = (recommendation?: string) => {
    if (!recommendation) return { icon: AlertTriangle, bgColor: 'bg-muted', textColor: 'text-muted-foreground', borderColor: 'border-muted' }
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

  const handleRegisterToNotion = async () => {
    if (!onRegisterToNotion) return
    
    setIsRegistering(true)
    setRegistrationResult(null)
    
    try {
      const result = await onRegisterToNotion()
      setRegistrationResult(result)
    } catch (error) {
      setRegistrationResult({ success: false, error: 'Failed to register sale' })
    } finally {
      setIsRegistering(false)
    }
  }

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
              Bank Verification Status
            </CardTitle>
            <Badge variant={data.success ? 'default' : 'destructive'} className="text-sm px-3 py-1">
              {data.success ? 'VERIFIED' : 'NOT FOUND'}
            </Badge>
          </div>
          <CardDescription>
            {data.success
              ? 'Transaction was found and confirmed in the official bank records'
              : data.error || data.message || 'Transaction could not be found in the bank system - this may indicate a fraudulent receipt'}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Payment Information - Main Section */}
      <Card className="border-2 border-primary/20">
        <CardHeader className="pb-2 bg-primary/5">
          <CardTitle className="text-lg flex items-center gap-2">
            <Banknote className="h-5 w-5 text-primary" />
            Payment Details
          </CardTitle>
          <CardDescription className="flex items-center gap-2">
            <Hash className="h-4 w-4" />
            Reference: <span className="font-mono font-medium text-foreground">{data.transactionReference || data.transferReference || 'Not provided'}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          {/* Payment Flow: Sender -> Receiver */}
          <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center mb-6 p-4 bg-muted/30 rounded-lg">
            {/* Sender */}
            <div className="flex flex-col items-center text-center gap-2">
              <div className="h-14 w-14 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <User className="h-7 w-7 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">From (Sender)</p>
                <p className="font-semibold text-lg">
                  {data.senderName || (data.success ? 'Name Hidden' : 'Not Found')}
                </p>
                <p className="text-sm font-mono text-muted-foreground">
                  {data.senderAccountNumber || (data.success ? 'Account Hidden' : 'N/A')}
                </p>
              </div>
            </div>

            {/* Arrow with Amount */}
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-2 px-4 py-2 bg-primary rounded-full text-primary-foreground">
                <span className="font-bold text-lg">
                  {data.transactionAmount > 0 
                    ? formatCurrency(data.transactionAmount) 
                    : data.total > 0 
                      ? formatCurrency(data.total) 
                      : 'ETB 0.00'}
                </span>
              </div>
              <ArrowRight className="h-6 w-6 text-primary" />
            </div>

            {/* Receiver */}
            <div className="flex flex-col items-center text-center gap-2">
              <div className="h-14 w-14 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <User className="h-7 w-7 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">To (Receiver)</p>
                <p className="font-semibold text-lg">
                  {data.receiverName || (data.narrative ? 'See Description' : (data.success ? 'Not Provided' : 'Not Found'))}
                </p>
                <p className="text-sm font-mono text-muted-foreground">
                  {data.receiverAccountNumber || (data.narrative ? 'Check below' : 'N/A')}
                </p>
              </div>
            </div>
          </div>

          {/* Amount Breakdown */}
          <div className="p-4 rounded-lg bg-muted/50 mb-4">
            <h4 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">Financial Breakdown</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex flex-col p-3 bg-primary/10 rounded-lg">
                <span className="text-xs text-muted-foreground">Transaction Amount</span>
                <span className="font-bold text-2xl text-primary">
                  {data.transactionAmount > 0 ? formatCurrency(data.transactionAmount) : 'ETB 0.00'}
                </span>
              </div>
              <div className="flex flex-col p-3 bg-background rounded-lg border">
                <span className="text-xs text-muted-foreground">Service Charge</span>
                <span className="font-medium text-lg">{formatCurrency(data.serviceCharge)}</span>
              </div>
              <div className="flex flex-col p-3 bg-background rounded-lg border">
                <span className="text-xs text-muted-foreground">Taxes (Excise + VAT)</span>
                <span className="font-medium text-lg">{formatCurrency((data.exciseTax || 0) + (data.vat || 0))}</span>
              </div>
              <div className="flex flex-col p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                <span className="text-xs text-muted-foreground">Total Paid</span>
                <span className="font-bold text-2xl text-green-700 dark:text-green-400">
                  {data.total > 0 ? formatCurrency(data.total) : formatCurrency(data.transactionAmount)}
                </span>
              </div>
            </div>
          </div>

          {/* Transaction Metadata Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Transaction Channel */}
            {data.transactionChannel && (
              <div className="flex items-start gap-3 p-3 rounded-lg border">
                <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground uppercase tracking-wide">Channel</span>
                  <span className="font-medium">{data.transactionChannel}</span>
                </div>
              </div>
            )}

            {/* Service Type */}
            {data.serviceType && (
              <div className="flex items-start gap-3 p-3 rounded-lg border">
                <CreditCard className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground uppercase tracking-wide">Service Type</span>
                  <span className="font-medium">{data.serviceType}</span>
                </div>
              </div>
            )}

            {/* Transaction Date */}
            {data.transactionDate && (
              <div className="flex items-start gap-3 p-3 rounded-lg border">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground uppercase tracking-wide">Date & Time</span>
                  <span className="font-medium">{data.transactionDate}</span>
                </div>
              </div>
            )}

            {/* Transfer Reference */}
            {data.transferReference && data.transferReference !== data.transactionReference && (
              <div className="flex items-start gap-3 p-3 rounded-lg border">
                <Hash className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground uppercase tracking-wide">Transfer Ref</span>
                  <span className="font-medium font-mono text-sm">{data.transferReference}</span>
                </div>
              </div>
            )}

            {/* Narrative/Description */}
            {data.narrative && (
              <div className="flex items-start gap-3 p-3 rounded-lg border col-span-2">
                <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex flex-col flex-1">
                  <span className="text-xs text-muted-foreground uppercase tracking-wide">Description / Reason</span>
                  <span className="font-medium">{data.narrative}</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* AI Analysis */}
      {data.aiAnalysis && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5" />
                AI Fraud Analysis
              </CardTitle>
              <Badge variant={getRiskBadgeVariant(data.aiAnalysis.riskLevel)} className="text-sm px-3 py-1">
                {data.aiAnalysis.riskLevel?.toUpperCase()} RISK
              </Badge>
            </div>
            <CardDescription>
              Automated fraud detection powered by Groq AI
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {/* Confidence Score */}
            <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/30">
              <div className="flex flex-col min-w-[100px]">
                <span className="text-sm text-muted-foreground">Confidence</span>
                <span className={`text-3xl font-bold ${getConfidenceColor(data.aiAnalysis.confidence)}`}>
                  {data.aiAnalysis.confidence}%
                </span>
              </div>
              <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    data.aiAnalysis.confidence >= 70
                      ? 'bg-green-500'
                      : data.aiAnalysis.confidence >= 40
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                  }`}
                  style={{ width: `${data.aiAnalysis.confidence}%` }}
                />
              </div>
            </div>

            {/* AI Summary */}
            <div className="rounded-lg bg-muted/50 p-4">
              <h4 className="text-sm font-medium mb-2 uppercase tracking-wide text-muted-foreground">AI Summary</h4>
              <p className="text-foreground leading-relaxed">{data.aiAnalysis.summary}</p>
            </div>



            {/* Observations */}
            {data.aiAnalysis.flags && data.aiAnalysis.flags.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wide">Detailed Observations</h4>
                <ul className="flex flex-col gap-2">
                  {data.aiAnalysis.flags.map((flag, index) => {
                    const isPositive = flag.toLowerCase().includes('confirmed') || 
                                       flag.toLowerCase().includes('verified') || 
                                       flag.toLowerCase().includes('match') ||
                                       flag.toLowerCase().includes('found') ||
                                       flag.toLowerCase().includes('valid') ||
                                       flag.toLowerCase().includes('legitimate') ||
                                       flag.toLowerCase().includes('success')
                    const isNegative = flag.toLowerCase().includes('not found') ||
                                       flag.toLowerCase().includes('suspicious') ||
                                       flag.toLowerCase().includes('mismatch') ||
                                       flag.toLowerCase().includes('missing') ||
                                       flag.toLowerCase().includes('failed') ||
                                       flag.toLowerCase().includes('invalid') ||
                                       flag.toLowerCase().includes('fraud') ||
                                       flag.toLowerCase().includes('fake') ||
                                       flag.toLowerCase().includes('not provided') ||
                                       flag.toLowerCase().includes('unavailable')
                    return (
                      <li key={index} className="flex items-start gap-2 text-sm p-2 rounded-md bg-muted/30">
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

      {/* Register to Notion Section */}
      {data.success && onRegisterToNotion && (
        <Card className="border-2 border-dashed border-primary/30 bg-primary/5">
          <CardContent className="py-6">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-primary" />
                <h3 className="font-semibold text-lg">Register Sale to Notion</h3>
              </div>
              <p className="text-sm text-muted-foreground max-w-md">
                Save this verified transaction to your Notion Sales database for record-keeping and analytics.
              </p>
              
              {registrationResult ? (
                registrationResult.success ? (
                  <div className="flex flex-col items-center gap-3 py-2">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                      <CheckCircle2 className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-green-700">Saved to Notion!</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Your sale has been recorded in your database
                      </p>
                    </div>
                    {registrationResult.pageUrl && (
                      <a 
                        href={registrationResult.pageUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                      >
                        View in Notion <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                ) : registrationResult.isDuplicate ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex items-center gap-2 text-yellow-600">
                      <AlertCircle className="h-5 w-5" />
                      <span className="font-medium">Already Registered</span>
                    </div>
                    <p className="text-sm text-muted-foreground text-center max-w-sm">
                      {registrationResult.error || 'This transaction is already in your database.'}
                    </p>
                    {registrationResult.existingPageUrl && (
                      <a 
                        href={registrationResult.existingPageUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm text-primary hover:underline"
                      >
                        View existing entry <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex items-center gap-2 text-red-600">
                      <XCircle className="h-5 w-5" />
                      <span className="font-medium">Registration Failed</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{registrationResult.error || 'Failed to register'}</p>
                  </div>
                )
              ) : (
                <Button 
                  onClick={handleRegisterToNotion} 
                  disabled={isRegistering}
                  size="lg"
                  className="gap-2"
                >
                  {isRegistering ? (
                    <>
                      <Spinner className="h-4 w-4" />
                      Registering...
                    </>
                  ) : (
                    <>
                      <BookOpen className="h-4 w-4" />
                      Register to Notion
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
