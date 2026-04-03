import Link from 'next/link'
import { ZonixLogo } from '@/components/zonix-logo'
import { Button } from '@/components/ui/button'
import { Footer } from '@/components/footer'
import { ShieldCheck, Lock, Eye } from 'lucide-react'

export const metadata = {
  title: 'Terms of Service | Zonix Cloud',
  description: 'Terms of Service for Zonix Cloud storage platform',
}

export default function TermsPage() {
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
        {/* Hero Section */}
        <section className="border-b bg-gradient-to-b from-primary/5 to-transparent py-12">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <ShieldCheck className="h-5 w-5 text-primary" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">Legal</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Terms of Service</h1>
            <p className="text-lg text-muted-foreground mb-4">Last updated: April 1, 2026</p>
            <p className="text-muted-foreground">
              Please read these terms carefully. By using Zonix Cloud, you agree to be bound by all terms and conditions outlined below.
            </p>
          </div>
        </section>

        {/* TOC */}
        <section className="border-b py-8 sticky top-16 bg-background/95 backdrop-blur">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-sm font-semibold text-muted-foreground mb-4">Quick navigation</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {[
                { id: '1', title: 'Acceptance of Terms' },
                { id: '2', title: 'Description of Service' },
                { id: '3', title: 'User Accounts' },
                { id: '4', title: 'Acceptable Use' },
                { id: '5', title: 'Storage Limits' },
                { id: '6', title: 'Privacy and Data' },
              ].map(item => (
                <Link key={item.id} href={`#section-${item.id}`} className="text-sm text-primary hover:underline">
                  {item.id}. {item.title}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-12">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="space-y-8">
              {/* Section 1 */}
              <section id="section-1" className="scroll-mt-32">
                <h2 className="text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
                <p className="text-muted-foreground leading-relaxed">
                  By accessing or using Zonix Cloud services, you agree to be bound by these Terms of Service. 
                  If you do not agree to these terms, please do not use our services. We reserve the right to 
                  update these terms at any time, and your continued use of the service constitutes acceptance 
                  of any changes.
                </p>
              </section>

              {/* Section 2 */}
              <section id="section-2" className="scroll-mt-32">
                <h2 className="text-2xl font-bold mb-4">2. Description of Service</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Zonix Cloud provides cloud storage services that allow you to store, access, and share files 
                  online. Our services include file storage, file sharing, collaboration features, and AI-powered 
                  file organization tools depending on your subscription tier.
                </p>
              </section>

              {/* Section 3 */}
              <section id="section-3" className="scroll-mt-32">
                <h2 className="text-2xl font-bold mb-4">3. User Accounts</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  You must create an account to use Zonix Cloud. You are responsible for maintaining the 
                  confidentiality of your account credentials and for all activities that occur under your 
                  account. You must provide accurate and complete information when creating your account 
                  and keep this information up to date.
                </p>
              </section>

              {/* Section 4 */}
              <section id="section-4" className="scroll-mt-32">
                <h2 className="text-2xl font-bold mb-4">4. Acceptable Use</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  You agree not to use Zonix Cloud to:
                </p>
                <ul className="space-y-3 ml-4">
                  {[
                    'Upload, store, or share illegal content',
                    'Infringe on intellectual property rights of others',
                    'Distribute malware, viruses, or harmful code',
                    'Attempt to gain unauthorized access to our systems',
                    'Use the service for spam or unsolicited communications',
                    'Violate any applicable laws or regulations',
                  ].map((item, i) => (
                    <li key={i} className="flex gap-3 text-muted-foreground">
                      <span className="text-primary font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* Section 5 */}
              <section id="section-5" className="scroll-mt-32">
                <h2 className="text-2xl font-bold mb-4">5. Storage Limits</h2>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  {[
                    { tier: 'Free', storage: '5 GB' },
                    { tier: 'Student', storage: '50 GB' },
                    { tier: 'Premium', storage: '100 GB' },
                    { tier: 'Enterprise', storage: 'Custom' },
                  ].map((item) => (
                    <div key={item.tier} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border">
                      <span className="font-medium">{item.tier}</span>
                      <span className="text-primary font-bold">{item.storage}</span>
                    </div>
                  ))}
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Exceeding your storage limit may result in restrictions on uploading new files.
                </p>
              </section>

              {/* Section 6 */}
              <section id="section-6" className="scroll-mt-32">
                <h2 className="text-2xl font-bold mb-4">6. Privacy and Data</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Your privacy is important to us. Please review our{' '}
                  <Link href="/privacy" className="text-primary hover:underline font-medium">Privacy Policy</Link>{' '}
                  to understand how we collect, use, and protect your data. You retain ownership of all 
                  content you upload to Zonix Cloud.
                </p>
              </section>

              {/* Section 7 */}
              <section id="section-7" className="scroll-mt-32">
                <h2 className="text-2xl font-bold mb-4">7. Payment and Billing</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Paid subscriptions are billed in advance on a monthly, quarterly, or yearly basis. 
                  All fees are non-refundable except as required by law. We reserve the right to change 
                  our pricing with 30 days notice. Student tier verification is subject to approval.
                </p>
              </section>

              {/* Section 8 */}
              <section id="section-8" className="scroll-mt-32">
                <h2 className="text-2xl font-bold mb-4">8. Termination</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We may suspend or terminate your account if you violate these terms. You may cancel 
                  your account at any time. Upon termination, your data may be deleted after a 30-day 
                  grace period.
                </p>
              </section>

              {/* Section 9 */}
              <section id="section-9" className="scroll-mt-32">
                <h2 className="text-2xl font-bold mb-4">9. Limitation of Liability</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Zonix Cloud is provided &quot;as is&quot; without warranties of any kind. We are not liable for 
                  any indirect, incidental, or consequential damages arising from your use of the service. 
                  Our total liability is limited to the amount you paid for the service in the past 12 months.
                </p>
              </section>

              {/* Section 10 */}
              <section id="section-10" className="scroll-mt-32">
                <h2 className="text-2xl font-bold mb-4">10. Contact</h2>
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <p className="text-muted-foreground">
                    For questions about these Terms of Service, please contact us at{' '}
                    <a href="mailto:gassetrashed454@gmail.com" className="text-primary hover:underline font-medium">
                      gassetrashed454@gmail.com
                    </a>
                  </p>
                </div>
              </section>
            </div>

            {/* CTA */}
            <div className="mt-16 pt-8 border-t">
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <Link href="/">
                  <Button variant="outline">Back to Home</Button>
                </Link>
                <Link href="/auth/signup">
                  <Button>Accept & Get Started</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}
