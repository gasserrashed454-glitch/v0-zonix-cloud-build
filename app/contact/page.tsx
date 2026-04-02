import Link from 'next/link'
import { ZonixLogo } from '@/components/zonix-logo'
import { Button } from '@/components/ui/button'
import { Footer } from '@/components/footer'
import { Mail } from 'lucide-react'

export const metadata = {
  title: 'Contact Us | Zonix Cloud',
  description: 'Get in touch with Zonix Cloud support team',
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <ZonixLogo className="h-8 w-8" />
            <span className="text-lg font-semibold">Zonix Cloud</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="sm">Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="py-24">
          <div className="container mx-auto px-4 max-w-2xl">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold tracking-tight mb-4">Get in Touch</h1>
              <p className="text-lg text-muted-foreground">Have questions? Our support team is here to help.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 rounded-xl border bg-card">
                <Mail className="h-8 w-8 text-primary mb-4" />
                <h3 className="font-semibold mb-2">Email Support</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Reach our support team for any questions or issues.
                </p>
                <a href="mailto:gassetrashed454@gmail.com" className="text-primary hover:underline font-medium">
                  gassetrashed454@gmail.com
                </a>
              </div>

              <div className="p-6 rounded-xl border bg-card">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <span className="text-primary font-bold">?</span>
                </div>
                <h3 className="font-semibold mb-2">FAQ</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Find answers to common questions about Zonix Cloud.
                </p>
                <Link href="/faq" className="text-primary hover:underline font-medium">
                  View FAQ
                </Link>
              </div>
            </div>

            <div className="mt-12 pt-12 border-t">
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Response Time</p>
                  <p className="text-foreground font-semibold">24-48 hours</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Support Hours</p>
                  <p className="text-foreground font-semibold">Mon - Fri, 9 AM - 6 PM UTC</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Status</p>
                  <p className="text-foreground font-semibold">
                    <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2" />
                    All Systems Operational
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
