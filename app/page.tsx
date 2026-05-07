import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ZonixLogo } from '@/components/zonix-logo'
import { Footer } from '@/components/footer'
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
    href: '/auth/signup',
    popular: false,
  },
  {
    name: 'Student',
    price: '$0',
    period: '2 months trial',
    features: ['20 GB storage', '10 GB upload limit', 'Unlimited AI', 'AI File Organization', 'Priority support'],
    cta: 'Verify Student',
    href: '/auth/signup?tier=student',
    popular: false,
  },
  {
    name: 'Pro',
    price: '$3',
    period: '/month',
    features: ['250 GB storage', '25 GB upload limit', 'Unlimited AI', 'Team management', 'Storage allocation'],
    cta: 'Upgrade Now',
    href: '/pricing',
    popular: true,
  },
  {
    name: 'Business',
    price: '$6',
    period: '/month',
    features: ['1 TB storage', '100 GB upload limit', 'Unlimited AI', 'Unlimited teams', 'Advanced analytics'],
    cta: 'Upgrade Now',
    href: '/pricing',
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
      <section className="py-20 md:py-32 bg-gradient-to-b from-blue-50 to-background">
        <div className="container mx-auto px-6 text-center max-w-3xl">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Secure Cloud Storage for Everyone
          </h1>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            Store, share, and organize your files with AI-powered organization. From 5GB free to 100TB enterprise.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="text-base h-12">
              <Link href="/auth/signup">Start for Free</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-base h-12">
              <Link href="/pricing">View Pricing</Link>
            </Button>
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
                  <Link href={tier.href}>
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
      <Footer />
    </div>
  )
}
