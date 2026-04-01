import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ZonixLogo } from '@/components/zonix-logo'
import { 
  Cloud, 
  Shield, 
  Sparkles, 
  Users, 
  HardDrive,
  ArrowRight,
  CheckCircle
} from 'lucide-react'

const features = [
  {
    icon: Cloud,
    title: 'Cloud Storage',
    description: 'Store your files securely in the cloud with up to 100GB of space.',
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'Bank-level encryption keeps your data safe and private.',
  },
  {
    icon: Sparkles,
    title: 'AI-Powered',
    description: 'Smart organization and search powered by advanced AI.',
  },
  {
    icon: Users,
    title: 'Easy Sharing',
    description: 'Share files and folders with anyone, anywhere.',
  },
]

const tiers = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    features: ['5 GB storage', '2 GB upload limit', 'AI Assistant (50/day)', 'Basic sharing'],
    cta: 'Get Started',
    popular: false,
  },
  {
    name: 'Student',
    price: '$0',
    period: 'with verification',
    features: ['50 GB storage', '20 GB upload limit', 'AI Assistant (200/day)', 'AI File Organization', 'Priority support'],
    cta: 'Verify Student Status',
    popular: false,
  },
  {
    name: 'Premium',
    price: '$4.99',
    period: '/month',
    features: ['100 GB storage', '50 GB upload limit', 'Unlimited AI features', 'Advanced AI tasks', 'Priority support'],
    cta: 'Upgrade Now',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    features: ['Custom storage', 'Custom limits', 'Dedicated support', 'SLA guarantee', 'Custom integrations'],
    cta: 'Contact Sales',
    popular: false,
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <ZonixLogo size="md" />
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </Link>
            <Link href="/support" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Support
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/auth/login">Sign in</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />
        <div className="container mx-auto px-6 py-24 md:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              Now with AI-powered file organization
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-balance mb-6">
              Your files, everywhere you need them
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground text-pretty mb-8 max-w-2xl mx-auto">
              Zonix Cloud gives you secure, intelligent cloud storage with AI-powered organization. 
              Access your files from anywhere, share with anyone, and let AI handle the rest.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/auth/signup">
                  Start for free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#pricing">View pricing</Link>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              No credit card required. 5 GB free forever.
            </p>
          </div>
        </div>
        
        {/* Hero illustration */}
        <div className="container mx-auto px-6 pb-24">
          <div className="relative max-w-5xl mx-auto">
            <div className="aspect-[16/10] rounded-xl border bg-gradient-to-br from-card to-muted/50 shadow-2xl overflow-hidden">
              <div className="h-10 bg-muted/50 border-b flex items-center px-4 gap-2">
                <div className="h-3 w-3 rounded-full bg-destructive/60" />
                <div className="h-3 w-3 rounded-full bg-warning/60" />
                <div className="h-3 w-3 rounded-full bg-success/60" />
                <div className="flex-1 flex justify-center">
                  <div className="h-5 w-48 rounded bg-background/50" />
                </div>
              </div>
              <div className="flex h-[calc(100%-2.5rem)]">
                <div className="w-56 border-r bg-sidebar/50 p-4 space-y-2">
                  <div className="h-8 w-full rounded bg-primary/20" />
                  <div className="h-6 w-3/4 rounded bg-muted" />
                  <div className="h-6 w-3/4 rounded bg-muted" />
                  <div className="h-6 w-3/4 rounded bg-muted" />
                  <div className="h-6 w-3/4 rounded bg-muted" />
                </div>
                <div className="flex-1 p-6">
                  <div className="grid grid-cols-4 gap-4">
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className="aspect-square rounded-lg bg-muted/50 border flex flex-col items-center justify-center gap-2 p-4">
                        <HardDrive className="h-8 w-8 text-primary/40" />
                        <div className="h-3 w-16 rounded bg-muted" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Everything you need for your files
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful features to help you store, organize, and share your files with ease.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="bg-card rounded-xl p-6 border shadow-sm hover:shadow-md transition-shadow">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose the plan that fits your needs. Upgrade or downgrade anytime.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={`relative rounded-xl border p-6 ${
                  tier.popular
                    ? 'border-primary shadow-lg ring-1 ring-primary'
                    : 'border-border'
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                    Most Popular
                  </div>
                )}
                <div className="mb-4">
                  <h3 className="font-semibold text-lg">{tier.name}</h3>
                  <div className="mt-2">
                    <span className="text-3xl font-bold">{tier.price}</span>
                    {tier.period && (
                      <span className="text-muted-foreground text-sm ml-1">{tier.period}</span>
                    )}
                  </div>
                </div>
                <ul className="space-y-3 mb-6">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  variant={tier.popular ? 'default' : 'outline'}
                  asChild
                >
                  <Link href={tier.name === 'Enterprise' ? '/contact' : '/auth/signup'}>
                    {tier.cta}
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Ready to get started?
          </h2>
          <p className="text-lg opacity-90 max-w-2xl mx-auto mb-8">
            Join thousands of users who trust Zonix Cloud with their files.
            Start with 5 GB free, no credit card required.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/auth/signup">
              Create your free account
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <ZonixLogo size="sm" />
            <nav className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
              <Link href="/support" className="hover:text-foreground transition-colors">Support</Link>
              <a href="mailto:gassetrashed454@gmail.com" className="hover:text-foreground transition-colors">Contact</a>
            </nav>
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Zonix Cloud
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
