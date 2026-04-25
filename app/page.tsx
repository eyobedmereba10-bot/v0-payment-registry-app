'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Shield, 
  Zap, 
  Camera, 
  CheckCircle, 
  ArrowRight,
  Building2,
  Smartphone,
  Clock,
  Target,
  Server,
  Activity,
  ChevronRight,
  Sparkles,
  BookOpen,
  Database
} from 'lucide-react'

const features = [
  {
    icon: Shield,
    title: 'Bank-Level Security',
    description: 'Direct API integration with Ethiopian banks for real-time transaction verification.',
    highlight: 'Secure',
  },
  {
    icon: Zap,
    title: 'AI-Powered Analysis',
    description: 'Intelligent fraud detection using advanced machine learning to identify suspicious patterns.',
    highlight: 'Fast',
  },
  {
    icon: Camera,
    title: 'Screenshot Recognition',
    description: 'Upload payment screenshots and our AI extracts all transaction details automatically.',
    highlight: 'Smart',
  },
  {
    icon: BookOpen,
    title: 'Notion Integration',
    description: 'Automatically register verified sales to your Notion database for seamless record-keeping.',
    highlight: 'New',
  },
]

const providers = [
  { name: 'CBE', fullName: 'Commercial Bank of Ethiopia', type: 'bank' },
  { name: 'Telebirr', fullName: 'Ethio Telecom Mobile Money', type: 'mobile' },
  { name: 'Dashen', fullName: 'Dashen Bank', type: 'bank' },
  { name: 'Abyssinia', fullName: 'Bank of Abyssinia', type: 'bank' },
  { name: 'CBE Birr', fullName: 'CBE Mobile Banking', type: 'mobile' },
  { name: 'M-Pesa', fullName: 'Safaricom M-Pesa', type: 'mobile' },
]

const steps = [
  {
    number: '01',
    title: 'Upload or Enter',
    description: 'Upload a payment screenshot or enter the transaction reference manually.',
    icon: Camera,
  },
  {
    number: '02',
    title: 'Instant Verification',
    description: 'We verify the transaction directly with the bank in real-time.',
    icon: Activity,
  },
  {
    number: '03',
    title: 'AI Analysis',
    description: 'Get detailed fraud risk assessment with actionable recommendations.',
    icon: Sparkles,
  },
]

const stats = [
  { value: 99.9, suffix: '%', label: 'Accuracy Rate', icon: Target },
  { value: 2, prefix: '<', suffix: 's', label: 'Response Time', icon: Clock },
  { value: 6, suffix: '+', label: 'Banks Supported', icon: Building2 },
  { value: 24, suffix: '/7', label: 'Availability', icon: Server },
]

function AnimatedCounter({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const [hasAnimated, setHasAnimated] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true)
          const duration = 1500
          const steps = 60
          const increment = value / steps
          let current = 0
          const timer = setInterval(() => {
            current += increment
            if (current >= value) {
              setCount(value)
              clearInterval(timer)
            } else {
              setCount(Math.floor(current * 10) / 10)
            }
          }, duration / steps)
        }
      },
      { threshold: 0.5 }
    )

    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [value, hasAnimated])

  return (
    <div ref={ref} className="text-4xl md:text-5xl font-bold tracking-tight">
      {prefix}{count}{suffix}
    </div>
  )
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-foreground text-background font-bold text-sm">
              PV
            </div>
            <span className="font-semibold text-lg tracking-tight">PayVerify</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#providers" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Providers</a>
            <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How it Works</a>
          </nav>
          <Link href="/verify">
            <Button size="sm" className="group">
              Open App
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-4">
        {/* Background decoration */}
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-muted-foreground/5 rounded-full blur-3xl animate-pulse-glow animation-delay-500" />
        
        <div className="container relative mx-auto max-w-5xl">
          <div className="text-center mb-16">
            {/* Trust badge */}
            <div className="inline-flex items-center gap-2 rounded-full border bg-background/80 backdrop-blur-sm px-4 py-2 text-sm mb-8 animate-fade-in">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-muted-foreground">Trusted by 500+ businesses across Ethiopia</span>
              <Badge variant="secondary" className="ml-1 text-xs">New</Badge>
            </div>
            
            {/* Main heading */}
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 animate-slide-up">
              Verify Ethiopian
              <br />
              <span className="text-muted-foreground">Payments Instantly</span>
            </h1>
            
            {/* Subheading */}
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 text-pretty animate-slide-up animation-delay-100">
              For business owners: Verify payments, detect fraud, and automatically 
              register sales to Notion. All from a screenshot or reference number.
            </p>
            
            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up animation-delay-200">
              <Link href="/verify">
                <Button size="lg" className="w-full sm:w-auto text-base px-8 group">
                  Start Verifying Free
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="w-full sm:w-auto text-base px-8 group">
                Watch Demo
                <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="flex items-center justify-center gap-6 mt-10 text-sm text-muted-foreground animate-fade-in animation-delay-300">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Setup in 30 seconds</span>
              </div>
            </div>
          </div>

          {/* Visual mockup */}
          <div className="relative max-w-3xl mx-auto animate-scale-in animation-delay-400">
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/10 via-transparent to-primary/10 rounded-2xl blur-xl" />
            <Card className="relative border-2 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-10 bg-muted/50 flex items-center px-4 gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <span className="ml-4 text-xs text-muted-foreground font-mono">payverify.app/verify</span>
              </div>
              <CardContent className="pt-14 pb-8 px-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-12 w-12 rounded-xl bg-green-100 dark:bg-green-900 flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <div className="font-semibold text-lg">Transaction Verified</div>
                    <div className="text-sm text-muted-foreground">CBE Transfer - REF: FT24123456789</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <div className="text-xs text-muted-foreground mb-1">Amount</div>
                    <div className="font-semibold">ETB 15,000.00</div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <div className="text-xs text-muted-foreground mb-1">Sender</div>
                    <div className="font-semibold">Abebe K.</div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <div className="text-xs text-muted-foreground mb-1">Risk Level</div>
                    <div className="font-semibold text-green-600">Low</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {stats.map((stat, index) => (
              <div 
                key={stat.label} 
                className="text-center group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-muted mb-4 group-hover:bg-primary/10 transition-colors">
                  <stat.icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <AnimatedCounter value={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">Features</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Why Choose PayVerify</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Built specifically for Ethiopian payment systems with cutting-edge AI technology.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card 
                key={feature.title} 
                className="relative overflow-hidden card-hover border-2 hover:border-primary/20"
              >
                <CardContent className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                      <feature.icon className="h-7 w-7" />
                    </div>
                    <Badge variant="secondary" className="text-xs">{feature.highlight}</Badge>
                  </div>
                  <h3 className="font-semibold text-xl mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Providers Section */}
      <section id="providers" className="py-24 px-4 bg-muted/20">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">Integrations</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Supported Payment Providers</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Seamlessly verify transactions from all major Ethiopian banks and mobile money services.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {providers.map((provider) => (
              <Card
                key={provider.name}
                className="card-hover border-2 hover:border-primary/20"
              >
                <CardContent className="flex items-center gap-4 p-5">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                    provider.type === 'mobile' 
                      ? 'bg-green-100 dark:bg-green-900/50' 
                      : 'bg-blue-100 dark:bg-blue-900/50'
                  }`}>
                    {provider.type === 'mobile' ? (
                      <Smartphone className={`h-6 w-6 ${
                        provider.type === 'mobile' 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-blue-600 dark:text-blue-400'
                      }`} />
                    ) : (
                      <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold">{provider.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{provider.fullName}</div>
                  </div>
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-24 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">Process</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Verify any payment in three simple steps.
            </p>
          </div>
          
          <div className="relative">
            {/* Connection line */}
            <div className="hidden md:block absolute top-24 left-[16.67%] right-[16.67%] h-0.5 bg-border" />
            
            <div className="grid md:grid-cols-3 gap-8 md:gap-12">
              {steps.map((step, index) => (
                <div key={step.number} className="relative text-center">
                  {/* Step number badge */}
                  <div className="relative inline-flex mb-8">
                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-muted border-2 border-background shadow-lg">
                      <step.icon className="h-8 w-8 text-foreground" />
                    </div>
                    <div className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-background text-sm font-bold">
                      {index + 1}
                    </div>
                  </div>
                  
                  <h3 className="font-semibold text-xl mb-3">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-4xl">
          <Card className="relative overflow-hidden border-2 bg-foreground text-background">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-background/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-background/5 rounded-full blur-3xl" />
            
            <CardContent className="relative py-16 px-8 md:px-16 text-center">
              <Badge variant="secondary" className="mb-6 bg-background/10 text-background border-background/20">
                Get Started
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
                Ready to Stop Payment Fraud?
              </h2>
              <p className="text-background/70 mb-8 max-w-xl mx-auto text-lg">
                Join hundreds of businesses across Ethiopia who trust PayVerify to protect their transactions.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/verify">
                  <Button size="lg" variant="secondary" className="w-full sm:w-auto text-base px-8 group">
                    Start Verifying Now
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 px-4 bg-muted/20">
        <div className="container mx-auto max-w-5xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-background font-bold text-xs">
                PV
              </div>
              <span className="font-semibold">PayVerify</span>
            </div>
            <div className="flex items-center gap-8 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms</a>
              <a href="#" className="hover:text-foreground transition-colors">Contact</a>
              <a href="#" className="hover:text-foreground transition-colors">API Docs</a>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4" />
              <span>Powered by Groq AI</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
