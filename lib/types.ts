export type PaymentProvider = 
  | 'cbe' 
  | 'telebirr' 
  | 'dashen' 
  | 'abyssinia' 
  | 'cbebirr' 
  | 'mpesa'
  | 'universal'

export interface VerificationRequest {
  reference: string
  suffix?: string
  phoneNumber?: string
  provider: PaymentProvider
}

export interface VerificationResponse {
  success: boolean
  senderName?: string
  senderAccountNumber?: string
  receiverName?: string
  receiverAccountNumber?: string
  transactionChannel?: string
  serviceType?: string
  narrative?: string
  transactionReference?: string
  transferReference?: string
  transactionAmount?: number
  serviceCharge?: number
  exciseTax?: number
  vat?: number
  total?: number
  transactionDate?: string
  error?: string
  message?: string
}

export interface Transaction {
  id: string
  reference: string
  provider: PaymentProvider
  amount: number
  senderName: string
  status: 'verified' | 'failed' | 'pending'
  verifiedAt: string
  aiAnalysis?: AIAnalysis
}

export interface AIAnalysis {
  confidence: number
  riskLevel: 'low' | 'medium' | 'high'
  summary: string
  flags: string[]
  recommendation?: string
  transactionDetails?: {
    verifiedSender: string
    verifiedReceiver: string
    verifiedAmount: string
    verifiedDate: string
    verifiedReference: string
    verificationStatus: string
  }
}

export interface ExtractedData {
  transactionReference: string
  amount?: string
  senderName?: string
  senderAccount?: string
  receiverName?: string
  receiverAccount?: string
  date?: string
  time?: string
  paymentMethod?: PaymentProvider | 'unknown'
  bankName?: string
  transactionType?: string
  status?: string
  additionalNotes?: string
}

export const PROVIDERS: { value: PaymentProvider; label: string; description: string }[] = [
  { value: 'universal', label: 'Auto-Detect', description: 'Automatically detects the provider' },
  { value: 'cbe', label: 'CBE', description: 'Commercial Bank of Ethiopia' },
  { value: 'telebirr', label: 'Telebirr', description: 'Ethio Telecom Mobile Money' },
  { value: 'dashen', label: 'Dashen Bank', description: 'Dashen Bank' },
  { value: 'abyssinia', label: 'Bank of Abyssinia', description: 'Bank of Abyssinia' },
  { value: 'cbebirr', label: 'CBE Birr', description: 'CBE Mobile Money' },
  { value: 'mpesa', label: 'M-Pesa', description: 'Safaricom M-Pesa' },
]
