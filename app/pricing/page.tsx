'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ZonixLogo } from '@/components/zonix-logo'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, Cloud, Sparkles, Building2, GraduationCap, ArrowRight } from 'lucide-react'

const tiers = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for personal use and getting started',
    icon: Cloud,
    features: [
      '5 GB storage',
      '2 GB upload limit per file',
      'AI Assistant (50 uses/day)',
      'Basic file management',
      'File sharing',
      'Web access',
    ],
    cta: 'Get Started',
    href: '/auth/signup',
    popular: false,
  },
  {
    name: 'Student',
    price: 'Free',
    period: 'with verification',
    description: 'Enhanced features for students',
    icon: GraduationCap,
    features: [
      '50 GB storage',
      '20 GB upload limit per file',
      'AI Assistant (unlimited)',
      'AI File Organization',
      'Priority support',
      'Collaboration tools',
    ],
    cta: 'Verify Student Status',
    href: '/auth/signup?tier=student',
    popular: false,
    badge: 'Students',
  },
  {
    name: 'Premium',
    price: '$4.99',
    period: '/month',
    description: 'Full power for professionals',
    icon: Sparkles,
    features: [
      '100 GB storage',
      '50 GB upload limit per file',
      'AI Assistant (unlimited)',
      'AI File Organization',
      'AI Task Automation',
      'Advanced sharing controls',
      'Version history',
      'Priority support',
    ],
    cta: 'Upgrade to Premium',
    href: '/auth/signup?tier=premium',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: 'pricing',
    description: 'Tailored solutions for your organization',
    icon: Building2,
    features: [
      'Unlimited storage',
      'Unlimited upload size',
      'All AI features',
      'Custom integrations',
      'Azure Storage linking',
      'Admin dashboard',
      'SLA guarantee',
      'Dedicated support',
    ],
    cta: 'Contact Sales',
    href: 'mailto:gassetrashed454@gmail.com?subject=Zonix Cloud Enterprise Inquiry',
    popular: false,
  },
]

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly')

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <ZonixLogo className="h-8 w-8" />
            <span className="text-xl font-semibold">Zonix Cloud</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/auth/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/auth/signup">
              <Button>Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Pricing Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your needs. Upgrade or downgrade at any time.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <span className={billingPeriod === 'monthly' ? 'font-medium' : 'text-muted-foreground'}>
            Monthly
          </span>
          <button
            onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'yearly' : 'monthly')}
            className="relative h-6 w-11 rounded-full bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            <span
              className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-primary transition-transform ${
                billingPeriod === 'yearly' ? 'translate-x-5' : ''
              }`}
            />
          </button>
          <span className={billingPeriod === 'yearly' ? 'font-medium' : 'text-muted-foreground'}>
            Yearly
            <Badge variant="secondary" className="ml-2">Save 20%</Badge>
          </span>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {tiers.map((tier) => {
            const Icon = tier.icon
            const yearlyPrice = tier.price.startsWith('$') 
              ? `$${(parseFloat(tier.price.slice(1)) * 12 * 0.8).toFixed(2)}`
              : tier.price

            return (
              <Card 
                key={tier.name} 
                className={`relative flex flex-col ${
                  tier.popular 
                    ? 'border-primary shadow-lg ring-1 ring-primary' 
                    : 'border-border'
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">
                      Most Popular
                    </Badge>
                  </div>
                )}
                {tier.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge variant="secondary">{tier.badge}</Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{tier.name}</CardTitle>
                  <CardDescription>{tier.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="text-center mb-6">
                    <span className="text-4xl font-bold">
                      {billingPeriod === 'yearly' && tier.price.startsWith('$') 
                        ? yearlyPrice 
                        : tier.price}
                    </span>
                    <span className="text-muted-foreground ml-1">
                      {billingPeriod === 'yearly' && tier.price.startsWith('$') 
                        ? '/year' 
                        : tier.period}
                    </span>
                  </div>
                  <ul className="space-y-3">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Link href={tier.href} className="w-full">
                    <Button 
                      className="w-full" 
                      variant={tier.popular ? 'default' : 'outline'}
                    >
                      {tier.cta}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            )
          })}
        </div>

        {/* FAQ Section */}
        <div className="mt-24 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <div className="border-b pb-4">
              <h3 className="font-semibold mb-2">How does student verification work?</h3>
              <p className="text-muted-foreground">
                Simply sign up with your official school email address (.edu or institution domain). 
                We&apos;ll send a verification code to confirm your student status.
              </p>
            </div>
            <div className="border-b pb-4">
              <h3 className="font-semibold mb-2">Can I upgrade or downgrade my plan?</h3>
              <p className="text-muted-foreground">
                Yes! You can change your plan at any time. When upgrading, you&apos;ll be charged 
                the prorated difference. When downgrading, your new rate starts at the next billing cycle.
              </p>
            </div>
            <div className="border-b pb-4">
              <h3 className="font-semibold mb-2">What happens if I exceed my storage limit?</h3>
              <p className="text-muted-foreground">
                You won&apos;t be able to upload new files until you either delete some files or 
                upgrade to a higher tier. Your existing files remain safe and accessible.
              </p>
            </div>
            <div className="border-b pb-4">
              <h3 className="font-semibold mb-2">Is my data secure?</h3>
              <p className="text-muted-foreground">
                Absolutely. All files are encrypted in transit and at rest. We use enterprise-grade 
                security measures to protect your data.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-24 text-center">
          <div className="bg-primary/5 rounded-2xl p-12">
            <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Join thousands of users who trust Zonix Cloud for their file storage needs.
            </p>
            <Link href="/auth/signup">
              <Button size="lg">
                Start Free Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-24 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Zonix Cloud. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
