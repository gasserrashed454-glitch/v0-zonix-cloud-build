import Link from 'next/link'
import { ZonixLogo } from '@/components/zonix-logo'
import { Button } from '@/components/ui/button'
import { Footer } from '@/components/footer'

export const metadata = {
  title: 'Security | Zonix Cloud',
  description: 'Learn about Zonix Cloud security features and infrastructure',
}

export default function SecurityPage() {
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
            <h1 className="text-4xl font-bold tracking-tight mb-6">Security & Privacy</h1>
            
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">🔐 Encryption</h2>
                <p className="text-muted-foreground">
                  All files are encrypted with AES-256 encryption during storage and TLS during transmission. 
                  Only you have access to the encryption keys for your files.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">🛡️ Infrastructure</h2>
                <p className="text-muted-foreground">
                  We use industry-leading cloud infrastructure with multiple redundancies and backup systems. 
                  Your data is replicated across multiple geographic locations for maximum availability.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">✅ Compliance</h2>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• GDPR Compliant</li>
                  <li>• CCPA Compliant</li>
                  <li>• SOC 2 Certified</li>
                  <li>• ISO 27001 Compliant</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">🔍 Transparency</h2>
                <p className="text-muted-foreground mb-4">
                  We believe in radical transparency about how we handle your data:
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• We never share data with third parties without your consent</li>
                  <li>• We never use your files for training or analysis</li>
                  <li>• We publish transparency reports regularly</li>
                  <li>• You can request access to all your data anytime</li>
                </ul>
              </div>

              <div className="p-6 rounded-xl bg-success/5 border border-success/20">
                <p className="font-semibold text-foreground mb-2">🎖️ Industry Recognition</p>
                <p className="text-muted-foreground">
                  Zonix Cloud has been recognized as a leader in cloud security by independent 
                  third-party auditors and security researchers.
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
