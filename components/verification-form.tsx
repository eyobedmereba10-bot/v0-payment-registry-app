'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { PROVIDERS, type PaymentProvider, type VerificationResponse } from '@/lib/types'

interface VerificationFormProps {
  onVerificationComplete: (data: VerificationResponse) => void
  onAnalyzing: (analyzing: boolean) => void
}

export function VerificationForm({ onVerificationComplete, onAnalyzing }: VerificationFormProps) {
  const [provider, setProvider] = useState<PaymentProvider>('universal')
  const [reference, setReference] = useState('')
  const [suffix, setSuffix] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const needsSuffix = ['cbe', 'abyssinia', 'universal'].includes(provider)
  const needsPhoneNumber = ['cbebirr', 'mpesa'].includes(provider)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    onAnalyzing(true)

    try {
      // First, verify the transaction
      const verifyResponse = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reference,
          suffix: needsSuffix ? suffix : undefined,
          phoneNumber: needsPhoneNumber ? phoneNumber : undefined,
          provider,
        }),
      })

      const verificationData: VerificationResponse = await verifyResponse.json()

      if (!verificationData.success) {
        setError(verificationData.error || 'Verification failed')
        onAnalyzing(false)
        return
      }

      // Then, analyze with AI
      const analyzeResponse = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(verificationData),
      })

      const analysis = await analyzeResponse.json()

      onVerificationComplete({
        ...verificationData,
        aiAnalysis: analysis,
      } as VerificationResponse & { aiAnalysis: unknown })
    } catch (err) {
      setError('Failed to verify transaction. Please try again.')
      console.error(err)
    } finally {
      setIsLoading(false)
      onAnalyzing(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl">Verify Payment</CardTitle>
        <CardDescription>
          Enter the transaction reference to verify a payment
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="provider">Payment Provider</Label>
            <Select value={provider} onValueChange={(value) => setProvider(value as PaymentProvider)}>
              <SelectTrigger id="provider">
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent>
                {PROVIDERS.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    <span className="font-medium">{p.label}</span>
                    <span className="ml-2 text-muted-foreground text-sm">- {p.description}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="reference">Reference Number</Label>
            <Input
              id="reference"
              placeholder="e.g., FT253089F68Z or 387WDTS252140001"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              required
            />
          </div>

          {needsSuffix && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="suffix">Account Suffix</Label>
              <Input
                id="suffix"
                placeholder="e.g., 16825193"
                value={suffix}
                onChange={(e) => setSuffix(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Last 8 digits of your account number (required for CBE and Abyssinia)
              </p>
            </div>
          )}

          {needsPhoneNumber && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                placeholder="e.g., 0911234567"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Phone number associated with the transaction
              </p>
            </div>
          )}

          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <Button type="submit" disabled={isLoading || !reference} className="mt-2">
            {isLoading ? (
              <>
                <Spinner className="mr-2 h-4 w-4" />
                Verifying...
              </>
            ) : (
              'Verify Transaction'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
