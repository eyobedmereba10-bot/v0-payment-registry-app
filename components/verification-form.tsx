'use client'

import { useState, useRef, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PROVIDERS, type PaymentProvider, type VerificationResponse, type ExtractedData } from '@/lib/types'
import { Upload, ImageIcon, X, CheckCircle2 } from 'lucide-react'

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
  
  // Screenshot upload state
  const [screenshot, setScreenshot] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isExtracting, setIsExtracting] = useState(false)
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const needsSuffix = ['cbe', 'abyssinia', 'universal'].includes(provider)
  const needsPhoneNumber = ['cbebirr', 'mpesa'].includes(provider)

  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file')
      return
    }
    
    setScreenshot(file)
    setPreviewUrl(URL.createObjectURL(file))
    setExtractedData(null)
    setError(null)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const file = e.dataTransfer.files[0]
    if (file) handleFileSelect(file)
  }, [handleFileSelect])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const clearScreenshot = () => {
    setScreenshot(null)
    setPreviewUrl(null)
    setExtractedData(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const extractFromScreenshot = async () => {
    if (!screenshot) return

    setIsExtracting(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('screenshot', screenshot)

      const response = await fetch('/api/extract', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!data.success) {
        setError(data.error || 'Failed to extract data')
        return
      }

      setExtractedData(data.extractedData)
      
      // Auto-fill the form with extracted data
      if (data.extractedData.transactionReference) {
        setReference(data.extractedData.transactionReference)
      }
      if (data.extractedData.paymentMethod && data.extractedData.paymentMethod !== 'unknown') {
        setProvider(data.extractedData.paymentMethod)
      }
      if (data.extractedData.senderAccount) {
        const accountSuffix = data.extractedData.senderAccount.slice(-8)
        setSuffix(accountSuffix)
      }
      if (data.extractedData.senderAccount && ['cbebirr', 'mpesa'].includes(data.extractedData.paymentMethod || '')) {
        setPhoneNumber(data.extractedData.senderAccount)
      }
    } catch (err) {
      setError('Failed to extract data from screenshot')
      console.error(err)
    } finally {
      setIsExtracting(false)
    }
  }

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await verifyTransaction()
  }

  const verifyTransaction = async () => {
    setError(null)
    setIsLoading(true)
    onAnalyzing(true)

    try {
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

      // Always run AI analysis - even if verification fails, we want AI to explain why
      const analyzeResponse = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verificationResult: verificationData,
          extractedData: extractedData,
        }),
      })

      const analysis = await analyzeResponse.json()

      onVerificationComplete({
        ...verificationData,
        aiAnalysis: analysis,
        extractedData: extractedData || undefined,
      } as VerificationResponse & { aiAnalysis: unknown; extractedData?: ExtractedData })
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
          Upload a screenshot or enter transaction details manually
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="screenshot" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="screenshot" className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              Screenshot
            </TabsTrigger>
            <TabsTrigger value="manual" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Manual Entry
            </TabsTrigger>
          </TabsList>

          <TabsContent value="screenshot" className="flex flex-col gap-4">
            {/* Upload Area */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`relative rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
                isDragging
                  ? 'border-primary bg-primary/5'
                  : 'border-muted-foreground/25 hover:border-muted-foreground/50'
              }`}
            >
              {previewUrl ? (
                <div className="relative">
                  <img
                    src={previewUrl}
                    alt="Payment screenshot"
                    className="mx-auto max-h-64 rounded-lg object-contain"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -right-2 -top-2 h-6 w-6"
                    onClick={clearScreenshot}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div className="rounded-full bg-muted p-3">
                    <ImageIcon className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">Drop your screenshot here</p>
                    <p className="text-sm text-muted-foreground">or click to browse</p>
                  </div>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                className="absolute inset-0 cursor-pointer opacity-0"
              />
            </div>

            {/* Extract Button */}
            {screenshot && !extractedData && (
              <Button
                type="button"
                onClick={extractFromScreenshot}
                disabled={isExtracting}
                variant="secondary"
              >
                {isExtracting ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4" />
                    Extracting Data...
                  </>
                ) : (
                  'Extract Transaction Data'
                )}
              </Button>
            )}

            {/* Extracted Data Display */}
            {extractedData && (
              <div className="rounded-lg border bg-muted/50 p-4">
                <div className="mb-3 flex items-center gap-2 text-sm font-medium text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                  Data Extracted Successfully
                </div>
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Reference:</span>
                    <span className="font-mono font-medium">{extractedData.transactionReference}</span>
                  </div>
                  {extractedData.amount && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Amount:</span>
                      <span className="font-medium">{extractedData.amount}</span>
                    </div>
                  )}
                  {extractedData.paymentMethod && extractedData.paymentMethod !== 'unknown' && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Provider:</span>
                      <span className="font-medium uppercase">{extractedData.paymentMethod}</span>
                    </div>
                  )}
                  {extractedData.senderName && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sender:</span>
                      <span className="font-medium">{extractedData.senderName}</span>
                    </div>
                  )}
                  {extractedData.receiverName && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Receiver:</span>
                      <span className="font-medium">{extractedData.receiverName}</span>
                    </div>
                  )}
                  {extractedData.date && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date:</span>
                      <span className="font-medium">{extractedData.date} {extractedData.time || ''}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Verify Button */}
            {extractedData && (
              <Button
                type="button"
                onClick={verifyTransaction}
                disabled={isLoading || !reference}
              >
                {isLoading ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4" />
                    Verifying...
                  </>
                ) : (
                  'Verify Transaction'
                )}
              </Button>
            )}

            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
          </TabsContent>

          <TabsContent value="manual">
            <form onSubmit={handleManualSubmit} className="flex flex-col gap-4">
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
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
