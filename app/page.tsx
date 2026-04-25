'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { 
  Shield, 
  Zap, 
  Camera, 
  CheckCircle, 
  ArrowRight,
  Building2,
  Smartphone,
  Globe
} from 'lucide-react'

const features = [
  {
    icon: Shield,
    title: 'Bank-Level Security',
    description: 'Direct API integration with Ethiopian banks for real-time transaction verification.',
  },
  {
    icon: Zap,
    title: 'AI-Powered Analysis',
    description: 'Intelligent fraud detection using advanced machine learning to identify suspicious patterns.',
  },
  {
    icon: Camera,
    title: 'Screenshot Recognition',
    description: 'Upload payment screenshots and our AI extracts all transaction details automatically.',
  },
]

const providers = [
  { name: 'CBE', fullName: 'Commercial Bank of Ethiopia' },
  { name: 'Telebirr', fullName: 'Ethio Telecom Mobile Money' },
  { name: 'Dashen', fullName: 'Dashen Bank' },
  { name: 'Abyssinia', fullName: 'Bank of Abyssinia' },
  { name: 'CBE Birr', fullName: 'CBE Mobile Banking' },
  { name: 'M-Pesa', fullName: 'Safaricom M-Pesa' },
]

const steps = [
  {
    number: '01',
    title: 'Upload or Enter',
    description: 'Upload a payment screenshot or enter the transaction reference manually.',
  },
  {
    number: '02',
    title: 'Instant Verification',
    description: 'We verify the transaction directly with the bank in real-time.',
  },
  {
    number: '03',
    title: 'AI Analysis',
    description: 'Get detailed fraud risk assessment with actionable recommendations.',
  },
]

export default function LandingPage() {
  const [email, setEmail] = useState('')

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-foreground text-background font-bold text-sm">
              PV
            </div>
            <span className="font-semibold text-lg">PayVerify</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#providers" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Providers</a>
            <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How it Works</a>
          </nav>
          <Link href="/verify">
            <Button size="sm">
              Open App
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm mb-6">
            <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
            Trusted by businesses across Ethiopia
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 text-balance">
            Verify Ethiopian Payments
            <span className="block text-muted-foreground">in Seconds</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 text-pretty">
            Stop fraud before it happens. Our AI-powered platform verifies transactions from CBE, Telebirr, Dashen, and more with bank-level accuracy.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/verify">
              <Button size="lg" className="w-full sm:w-auto">
                Start Verifying
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              View Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '99.9%', label: 'Accuracy' },
              { value: '<2s', label: 'Response Time' },
              { value: '6+', label: 'Banks Supported' },
              { value: '24/7', label: 'Availability' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl md:text-4xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose PayVerify</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Built specifically for Ethiopian payment systems with cutting-edge AI technology.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="rounded-xl border p-6 bg-card">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted mb-4">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Supported Providers */}
      <section id="providers" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Supported Payment Providers</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Seamlessly verify transactions from all major Ethiopian banks and mobile money services.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {providers.map((provider) => (
              <div
                key={provider.name}
                className="flex items-center gap-4 rounded-lg border bg-card p-4"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  {provider.name === 'Telebirr' || provider.name === 'M-Pesa' || provider.name === 'CBE Birr' ? (
                    <Smartphone className="h-5 w-5" />
                  ) : (
                    <Building2 className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <div className="font-medium">{provider.name}</div>
                  <div className="text-xs text-muted-foreground">{provider.fullName}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Verify any payment in three simple steps.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={step.number} className="relative">
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-px bg-border -translate-x-1/2" />
                )}
                <div className="text-5xl font-bold text-muted-foreground/20 mb-4">{step.number}</div>
                <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-foreground text-background">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Stop Payment Fraud?
          </h2>
          <p className="text-background/70 mb-8 max-w-xl mx-auto">
            Join businesses across Ethiopia who trust PayVerify to protect their transactions.
          </p>
          <Link href="/verify">
            <Button size="lg" variant="secondary">
              Start Verifying Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-background font-bold text-xs">
                PV
              </div>
              <span className="font-semibold">PayVerify</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms</a>
              <a href="#" className="hover:text-foreground transition-colors">Contact</a>
            </div>
            <div className="text-sm text-muted-foreground">
              Powered by Groq AI
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
