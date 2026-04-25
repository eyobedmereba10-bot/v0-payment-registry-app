'use client'

import { useState } from 'react'
import Link from 'next/link'
import { VerificationForm } from '@/components/verification-form'
import { VerificationResult } from '@/components/verification-result'
import { TransactionHistory } from '@/components/transaction-history'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { ArrowLeft, Shield } from 'lucide-react'
import type { VerificationResponse, AIAnalysis } from '@/lib/types'

type TransactionWithMeta = VerificationResponse & { aiAnalysis?: AIAnalysis; timestamp: string }

export default function VerifyPage() {
  const [currentResult, setCurrentResult] = useState<TransactionWithMeta | null>(null)
  const [history, setHistory] = useState<TransactionWithMeta[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handleVerificationComplete = (data: VerificationResponse & { aiAnalysis?: AIAnalysis }) => {
    const transactionWithTimestamp = {
      ...data,
      timestamp: new Date().toISOString(),
    }
    setCurrentResult(transactionWithTimestamp)
    setHistory((prev) => [transactionWithTimestamp, ...prev].slice(0, 10))
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div className="h-6 w-px bg-border" />
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-background font-bold text-xs">
                  PV
                </div>
                <span className="font-semibold">PayVerify</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Secure Verification</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Verify Payment</h1>
          <p className="text-muted-foreground">
            Upload a screenshot or enter transaction details to verify and analyze payments.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left Column - Form and History */}
          <div className="flex flex-col gap-6">
            <VerificationForm
              onVerificationComplete={handleVerificationComplete}
              onAnalyzing={setIsAnalyzing}
            />
            <TransactionHistory transactions={history} />
          </div>

          {/* Right Column - Results */}
          <div className="flex flex-col gap-6">
            {isAnalyzing ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Spinner className="h-8 w-8 mb-4" />
                  <p className="font-medium mb-1">Verifying Transaction</p>
                  <p className="text-sm text-muted-foreground">Connecting to bank API and analyzing with AI...</p>
                </CardContent>
              </Card>
            ) : currentResult ? (
              <VerificationResult data={currentResult} />
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                    <Shield className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Ready to Verify</h3>
                  <p className="text-sm text-muted-foreground max-w-xs">
                    Upload a payment screenshot or enter a transaction reference to verify and get AI-powered fraud analysis.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Info Card */}
            <Card className="bg-muted/30">
              <CardContent className="py-4">
                <h3 className="text-sm font-medium mb-3">Supported Providers</h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    'CBE',
                    'Telebirr',
                    'Dashen',
                    'Abyssinia',
                    'CBE Birr',
                    'M-Pesa',
                  ].map((provider) => (
                    <span
                      key={provider}
                      className="inline-flex items-center rounded-full border bg-background px-2.5 py-0.5 text-xs font-medium"
                    >
                      {provider}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
