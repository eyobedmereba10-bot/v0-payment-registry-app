'use client'

import { useState } from 'react'
import { VerificationForm } from '@/components/verification-form'
import { VerificationResult } from '@/components/verification-result'
import { TransactionHistory } from '@/components/transaction-history'
import { Card, CardContent } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import type { VerificationResponse, AIAnalysis } from '@/lib/types'

type TransactionWithMeta = VerificationResponse & { aiAnalysis?: AIAnalysis; timestamp: string }

export default function HomePage() {
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
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
              PV
            </div>
            <div>
              <h1 className="text-xl font-semibold">Payment Verifier</h1>
              <p className="text-sm text-muted-foreground">
                Ethiopian Payment Verification System
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
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
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Spinner className="h-8 w-8 mb-4" />
                  <p className="text-muted-foreground">Verifying transaction and analyzing with AI...</p>
                </CardContent>
              </Card>
            ) : currentResult ? (
              <VerificationResult data={currentResult} />
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                    <svg
                      className="h-8 w-8 text-muted-foreground"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="font-medium mb-1">No Verification Yet</h3>
                  <p className="text-sm text-muted-foreground max-w-xs">
                    Enter a transaction reference number to verify a payment and get AI-powered analysis
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Supported Providers */}
            <Card>
              <CardContent className="py-4">
                <h3 className="text-sm font-medium mb-3">Supported Payment Providers</h3>
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
                      className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium"
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

      <footer className="border-t mt-auto">
        <div className="container mx-auto px-4 py-4">
          <p className="text-center text-sm text-muted-foreground">
            Powered by Groq AI for intelligent transaction analysis
          </p>
        </div>
      </footer>
    </div>
  )
}
