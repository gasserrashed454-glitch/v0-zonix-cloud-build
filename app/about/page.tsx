import Link from 'next/link'
import { ZonixLogo } from '@/components/zonix-logo'
import { Button } from '@/components/ui/button'
import { Footer } from '@/components/footer'

export const metadata = {
  title: 'About Us | Zonix Cloud',
  description: 'Learn about Zonix Cloud and our mission',
}

export default function AboutPage() {
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
          <div className="container mx-auto px-4 max-w-3xl">
            <h1 className="text-4xl font-bold tracking-tight mb-6">About Zonix Cloud</h1>
            
            <div className="space-y-8 text-lg text-muted-foreground">
              <p>
                Zonix Cloud is a modern cloud storage platform designed with security, simplicity, and intelligence at its core. 
                We believe everyone deserves secure access to their files, anywhere, anytime.
              </p>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">Our Mission</h2>
                <p>
                  To provide the world&apos;s most secure, intelligent, and user-friendly cloud storage solution that empowers 
                  individuals and organizations to store, organize, and share their digital lives with confidence.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">Our Values</h2>
                <ul className="space-y-3">
                  <li className="flex gap-3">
                    <span className="text-primary font-bold">•</span>
                    <span><strong>Security First</strong> - Your data protection is our top priority</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-primary font-bold">•</span>
                    <span><strong>User Privacy</strong> - We never sell your data</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-primary font-bold">•</span>
                    <span><strong>Innovation</strong> - We leverage AI to enhance your experience</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-primary font-bold">•</span>
                    <span><strong>Accessibility</strong> - Quality storage for everyone</span>
                  </li>
                </ul>
              </div>

              <div className="p-6 rounded-xl bg-primary/5 border border-primary/20">
                <p className="text-lg font-semibold text-foreground mb-2">Built for Everyone</p>
                <p>
                  From students to enterprises, Zonix Cloud offers flexible plans that scale with your needs. 
                  Whether you&apos;re storing personal files or collaborating with your team, we&apos;ve got you covered.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
