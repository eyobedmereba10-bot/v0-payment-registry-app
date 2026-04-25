'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
  BookOpen,
  ExternalLink
} from 'lucide-react'
import type { VerificationResponse, AIAnalysis } from '@/lib/types'

interface NotionResult {
  success: boolean
  pageUrl?: string
  error?: string
  isDuplicate?: boolean
  existingPageUrl?: string
}

interface VerificationResultProps {
  data: VerificationResponse & { 
    aiAnalysis?: AIAnalysis
    notionResult?: NotionResult
  }
}

export function VerificationResult({ data }: VerificationResultProps) {
  const formatCurrency = (amount?: number | null) => {
    if (amount === undefined || amount === null || amount === 0) return 'ETB 0.00'
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 2,
    }).format(amount)
  }

  // Determine the overall status based on verification and Notion results
  const getOverallStatus = () => {
    // Payment verification failed - likely fraud
    if (!data.success) {
      return {
        type: 'rejected' as const,
        title: 'Payment Rejected - Possible Fraud',
        description: 'This transaction could not be verified in the bank system. The payment receipt may be fake or invalid.',
        icon: ShieldX,
        bgColor: 'bg-red-50 dark:bg-red-950',
        borderColor: 'border-red-300 dark:border-red-800',
        textColor: 'text-red-800 dark:text-red-200',
        iconBgColor: 'bg-red-100 dark:bg-red-900',
        iconColor: 'text-red-600 dark:text-red-400',
      }
    }
    
    // Payment verified but already exists in Notion
    if (data.notionResult?.isDuplicate) {
      return {
        type: 'duplicate' as const,
        title: 'Already Registered',
        description: 'This payment reference has already been saved to your Notion database. Please provide a different payment to register.',
        icon: AlertCircle,
        bgColor: 'bg-yellow-50 dark:bg-yellow-950',
        borderColor: 'border-yellow-300 dark:border-yellow-800',
        textColor: 'text-yellow-800 dark:text-yellow-200',
        iconBgColor: 'bg-yellow-100 dark:bg-yellow-900',
        iconColor: 'text-yellow-600 dark:text-yellow-400',
      }
    }
    
    // Payment verified and saved to Notion successfully
    if (data.notionResult?.success) {
      return {
        type: 'saved' as const,
        title: 'Payment Verified & Saved to Notion',
        description: 'This payment has been verified as legitimate and automatically saved to your Notion database.',
        icon: CheckCircle2,
        bgColor: 'bg-green-50 dark:bg-green-950',
        borderColor: 'border-green-300 dark:border-green-800',
        textColor: 'text-green-800 dark:text-green-200',
        iconBgColor: 'bg-green-100 dark:bg-green-900',
        iconColor: 'text-green-600 dark:text-green-400',
      }
    }
    
    // Payment verified but Notion save failed
    if (data.success && data.notionResult && !data.notionResult.success) {
      return {
        type: 'verified-not-saved' as const,
        title: 'Payment Verified - Not Saved',
        description: data.notionResult.error || 'Payment was verified but could not be saved to Notion. Please check your Notion configuration.',
        icon: AlertTriangle,
        bgColor: 'bg-blue-50 dark:bg-blue-950',
        borderColor: 'border-blue-300 dark:border-blue-800',
        textColor: 'text-blue-800 dark:text-blue-200',
        iconBgColor: 'bg-blue-100 dark:bg-blue-900',
        iconColor: 'text-blue-600 dark:text-blue-400',
      }
    }

    // Default: verified but no Notion result yet
    return {
      type: 'verified' as const,
      title: 'Payment Verified',
      description: 'This payment has been verified as legitimate.',
      icon: CheckCircle2,
      bgColor: 'bg-green-50 dark:bg-green-950',
      borderColor: 'border-green-300 dark:border-green-800',
      textColor: 'text-green-800 dark:text-green-200',
      iconBgColor: 'bg-green-100 dark:bg-green-900',
      iconColor: 'text-green-600 dark:text-green-400',
    }
  }

  const status = getOverallStatus()
  const StatusIcon = status.icon

  return (
    <div className="flex flex-col gap-4">
      {/* Main Status Banner */}
      <Card className={`border-2 ${status.borderColor} ${status.bgColor}`}>
        <CardContent className="py-6">
          <div className="flex flex-col items-center text-center gap-4">
            <div className={`flex h-16 w-16 items-center justify-center rounded-full ${status.iconBgColor}`}>
              <StatusIcon className={`h-8 w-8 ${status.iconColor}`} />
            </div>
            <div>
              <h2 className={`text-xl font-bold ${status.textColor}`}>{status.title}</h2>
              <p className={`text-sm mt-2 max-w-lg ${status.textColor} opacity-80`}>{status.description}</p>
            </div>
            
            {/* Action Buttons based on status */}
            {status.type === 'saved' && data.notionResult?.pageUrl && (
              <a 
                href={data.notionResult.pageUrl} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Button className="gap-2 mt-2">
                  <BookOpen className="h-4 w-4" />
                  View in Notion
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </a>
            )}
            
            {status.type === 'duplicate' && data.notionResult?.existingPageUrl && (
              <a 
                href={data.notionResult.existingPageUrl} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Button variant="outline" className="gap-2 mt-2">
                  View Existing Entry
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </a>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payment Details Card */}
      {(data.senderName || data.transactionAmount || data.transactionReference) && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Banknote className="h-5 w-5 text-primary" />
                Payment Details
              </CardTitle>
              {data.aiAnalysis?.riskLevel && (
                <Badge 
                  className={
                    data.aiAnalysis.riskLevel === 'low' 
                      ? 'bg-green-100 text-green-700 hover:bg-green-100' 
                      : data.aiAnalysis.riskLevel === 'medium'
                        ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100'
                        : 'bg-red-100 text-red-700 hover:bg-red-100'
                  }
                >
                  {data.aiAnalysis.riskLevel.toUpperCase()} RISK
                </Badge>
              )}
            </div>
            <CardDescription className="flex items-center gap-2">
              <Hash className="h-4 w-4" />
              Reference: <span className="font-mono font-medium text-foreground">{data.transactionReference || 'N/A'}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            {/* Payment Flow: Sender -> Receiver */}
            <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center p-4 bg-muted/30 rounded-lg">
              {/* Sender */}
              <div className="flex flex-col items-center text-center gap-2">
                <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Sender</p>
                  <p className="font-semibold">{data.senderName || 'Unknown'}</p>
                  {data.senderAccountNumber && (
                    <p className="text-xs font-mono text-muted-foreground">{data.senderAccountNumber}</p>
                  )}
                </div>
              </div>

              {/* Arrow with Amount */}
              <div className="flex flex-col items-center gap-1">
                <div className="px-3 py-1.5 bg-primary rounded-full text-primary-foreground">
                  <span className="font-bold">
                    {formatCurrency(data.transactionAmount || data.total)}
                  </span>
                </div>
                <ArrowRight className="h-5 w-5 text-primary" />
              </div>

              {/* Receiver */}
              <div className="flex flex-col items-center text-center gap-2">
                <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                  <User className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Receiver</p>
                  <p className="font-semibold">{data.receiverName || 'See Details'}</p>
                  {data.receiverAccountNumber && (
                    <p className="text-xs font-mono text-muted-foreground">{data.receiverAccountNumber}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Transaction Details Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {data.transactionChannel && (
                <div className="flex flex-col gap-1 p-3 rounded-lg bg-muted/50">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Building2 className="h-3 w-3" /> Channel
                  </span>
                  <span className="text-sm font-medium">{data.transactionChannel}</span>
                </div>
              )}
              
              {data.transactionDate && (
                <div className="flex flex-col gap-1 p-3 rounded-lg bg-muted/50">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Date
                  </span>
                  <span className="text-sm font-medium">{data.transactionDate}</span>
                </div>
              )}
              
              {data.serviceType && (
                <div className="flex flex-col gap-1 p-3 rounded-lg bg-muted/50">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <CreditCard className="h-3 w-3" /> Type
                  </span>
                  <span className="text-sm font-medium">{data.serviceType}</span>
                </div>
              )}

              {(data.transactionAmount > 0 || data.total > 0) && (
                <div className="flex flex-col gap-1 p-3 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
                  <span className="text-xs text-muted-foreground">Total</span>
                  <span className="text-sm font-bold text-green-700 dark:text-green-400">
                    {formatCurrency(data.total || data.transactionAmount)}
                  </span>
                </div>
              )}
            </div>

            {/* Narrative */}
            {data.narrative && (
              <div className="p-3 rounded-lg bg-muted/50">
                <span className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                  <FileText className="h-3 w-3" /> Description
                </span>
                <p className="text-sm">{data.narrative}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* AI Analysis Card */}
      {data.aiAnalysis && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                {data.aiAnalysis.riskLevel === 'low' && <ShieldCheck className="h-5 w-5 text-green-600" />}
                {data.aiAnalysis.riskLevel === 'medium' && <ShieldAlert className="h-5 w-5 text-yellow-600" />}
                {data.aiAnalysis.riskLevel === 'high' && <ShieldX className="h-5 w-5 text-red-600" />}
                AI Fraud Analysis
              </CardTitle>
              <span className={`text-2xl font-bold ${
                data.aiAnalysis.confidence >= 70 ? 'text-green-600' :
                data.aiAnalysis.confidence >= 40 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {data.aiAnalysis.confidence}%
              </span>
            </div>
            <CardDescription>Confidence Score</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Summary */}
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm leading-relaxed">{data.aiAnalysis.summary}</p>
            </div>

            {/* Recommendation */}
            {data.aiAnalysis.recommendation && (
              <div className={`p-4 rounded-lg border-2 ${
                data.aiAnalysis.recommendation.toUpperCase().includes('APPROVE') 
                  ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800' 
                  : data.aiAnalysis.recommendation.toUpperCase().includes('REJECT')
                    ? 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800'
                    : 'bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800'
              }`}>
                <p className="font-semibold text-sm flex items-center gap-2">
                  {data.aiAnalysis.recommendation.toUpperCase().includes('APPROVE') && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                  {data.aiAnalysis.recommendation.toUpperCase().includes('REJECT') && <XCircle className="h-4 w-4 text-red-600" />}
                  {data.aiAnalysis.recommendation.toUpperCase().includes('REVIEW') && <AlertTriangle className="h-4 w-4 text-yellow-600" />}
                  {data.aiAnalysis.recommendation}
                </p>
              </div>
            )}

            {/* Observations */}
            {data.aiAnalysis.flags && data.aiAnalysis.flags.length > 0 && (
              <div className="space-y-2">
                <span className="text-sm font-medium text-muted-foreground">Observations:</span>
                <div className="space-y-1">
                  {data.aiAnalysis.flags.map((flag, index) => {
                    const isPositive = /verified|confirmed|legitimate|valid|success|found|match/i.test(flag)
                    const isNegative = /suspicious|fraud|risk|invalid|fake|mismatch|missing|failed|not found/i.test(flag)
                    return (
                      <div 
                        key={index} 
                        className={`flex items-start gap-2 text-sm p-2 rounded ${
                          isPositive ? 'bg-green-50 dark:bg-green-950 text-green-800 dark:text-green-200' :
                          isNegative ? 'bg-red-50 dark:bg-red-950 text-red-800 dark:text-red-200' :
                          'bg-muted/50'
                        }`}
                      >
                        {isPositive && <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />}
                        {isNegative && <XCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />}
                        {!isPositive && !isNegative && <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />}
                        <span>{flag}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Confidence Bar */}
            <div className="space-y-2 pt-2">
              <div className="h-3 rounded-full bg-muted overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all ${
                    data.aiAnalysis.confidence >= 70 ? 'bg-green-500' :
                    data.aiAnalysis.confidence >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${data.aiAnalysis.confidence}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
