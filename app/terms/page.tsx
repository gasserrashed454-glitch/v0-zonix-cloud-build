import Link from 'next/link'
import { ZonixLogo } from '@/components/zonix-logo'
import { Button } from '@/components/ui/button'

export const metadata = {
  title: 'Terms of Service | Zonix Cloud',
  description: 'Terms of Service for Zonix Cloud storage platform',
}

export default function TermsPage() {
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

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
        <p className="text-muted-foreground mb-8">Last updated: April 1, 2026</p>

        <div className="prose prose-slate max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing or using Zonix Cloud services, you agree to be bound by these Terms of Service. 
              If you do not agree to these terms, please do not use our services. We reserve the right to 
              update these terms at any time, and your continued use of the service constitutes acceptance 
              of any changes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
            <p className="text-muted-foreground leading-relaxed">
              Zonix Cloud provides cloud storage services that allow you to store, access, and share files 
              online. Our services include file storage, file sharing, collaboration features, and AI-powered 
              file organization tools depending on your subscription tier.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
            <p className="text-muted-foreground leading-relaxed">
              You must create an account to use Zonix Cloud. You are responsible for maintaining the 
              confidentiality of your account credentials and for all activities that occur under your 
              account. You must provide accurate and complete information when creating your account 
              and keep this information up to date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Acceptable Use</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              You agree not to use Zonix Cloud to:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Upload, store, or share illegal content</li>
              <li>Infringe on intellectual property rights of others</li>
              <li>Distribute malware, viruses, or harmful code</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Use the service for spam or unsolicited communications</li>
              <li>Violate any applicable laws or regulations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Storage Limits</h2>
            <p className="text-muted-foreground leading-relaxed">
              Your storage allocation depends on your subscription tier. Free accounts receive 5GB of 
              storage, Student accounts receive 50GB, and Premium accounts receive 100GB. Enterprise 
              accounts have custom storage limits. Exceeding your storage limit may result in 
              restrictions on uploading new files.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Privacy and Data</h2>
            <p className="text-muted-foreground leading-relaxed">
              Your privacy is important to us. Please review our{' '}
              <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>{' '}
              to understand how we collect, use, and protect your data. You retain ownership of all 
              content you upload to Zonix Cloud.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Payment and Billing</h2>
            <p className="text-muted-foreground leading-relaxed">
              Paid subscriptions are billed in advance on a monthly, quarterly, or yearly basis. 
              All fees are non-refundable except as required by law. We reserve the right to change 
              our pricing with 30 days notice. Student tier verification is subject to approval.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Termination</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may suspend or terminate your account if you violate these terms. You may cancel 
              your account at any time. Upon termination, your data may be deleted after a 30-day 
              grace period.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              Zonix Cloud is provided &quot;as is&quot; without warranties of any kind. We are not liable for 
              any indirect, incidental, or consequential damages arising from your use of the service. 
              Our total liability is limited to the amount you paid for the service in the past 12 months.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              For questions about these Terms of Service, please contact us at{' '}
              <a href="mailto:gassetrashed454@gmail.com" className="text-primary hover:underline">
                gassetrashed454@gmail.com
              </a>
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <Link href="/">
            <Button variant="outline">Back to Home</Button>
          </Link>
        </div>
      </main>
    </div>
  )
}
