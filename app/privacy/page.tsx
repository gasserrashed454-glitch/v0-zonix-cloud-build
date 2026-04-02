import Link from 'next/link'
import { ZonixLogo } from '@/components/zonix-logo'
import { Button } from '@/components/ui/button'
import { Footer } from '@/components/footer'
import { Lock } from 'lucide-react'

export const metadata = {
  title: 'Privacy Policy | Zonix Cloud',
  description: 'Privacy Policy for Zonix Cloud storage platform',
}

export default function PrivacyPage() {
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
                <Lock className="h-5 w-5 text-primary" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">Legal</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Privacy Policy</h1>
            <p className="text-lg text-muted-foreground mb-4">Last updated: April 1, 2026</p>
            <p className="text-muted-foreground">
              We believe privacy is a right, not a privilege. Learn how we protect your data.
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="py-12">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="space-y-8">
              {/* Section 1 */}
              <section>
                <h2 className="text-2xl font-bold mb-4">1. Introduction</h2>
                <p className="text-muted-foreground leading-relaxed">
                  At Zonix Cloud, we take your privacy seriously. This Privacy Policy explains how we 
                  collect, use, disclose, and safeguard your information when you use our cloud storage 
                  service. Please read this policy carefully to understand our practices regarding your 
                  personal data.
                </p>
              </section>

              {/* Section 2 */}
              <section>
                <h2 className="text-2xl font-bold mb-4">2. Information We Collect</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We collect information you provide directly to us, including:
                </p>
                <ul className="space-y-3 ml-4">
                  {[
                    'Account information (name, email address, password)',
                    'Profile information (avatar, display name)',
                    'Files and content you upload to our service',
                    'Payment information for premium subscriptions',
                    'Communications with our support team',
                    'Student verification documents (for student tier)',
                  ].map((item, i) => (
                    <li key={i} className="flex gap-3 text-muted-foreground">
                      <span className="text-primary font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* Section 3 */}
              <section>
                <h2 className="text-2xl font-bold mb-4">3. Automatically Collected Information</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  When you use our service, we automatically collect:
                </p>
                <ul className="space-y-3 ml-4">
                  {[
                    'Device information (browser type, operating system)',
                    'Log data (IP address, access times, pages viewed)',
                    'Usage patterns and feature interactions',
                    'Location data (approximate, based on IP address)',
                  ].map((item, i) => (
                    <li key={i} className="flex gap-3 text-muted-foreground">
                      <span className="text-primary font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* Section 4 */}
              <section>
                <h2 className="text-2xl font-bold mb-4">4. How We Use Your Information</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We use the information we collect to:
                </p>
                <ul className="space-y-3 ml-4">
                  {[
                    'Provide, maintain, and improve our services',
                    'Process transactions and send related information',
                    'Send technical notices and support messages',
                    'Respond to your comments and questions',
                    'Detect and prevent fraud and abuse',
                    'Comply with legal obligations',
                  ].map((item, i) => (
                    <li key={i} className="flex gap-3 text-muted-foreground">
                      <span className="text-primary font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* Section 5 */}
              <section>
                <h2 className="text-2xl font-bold mb-4">5. Data Storage and Security</h2>
                <div className="p-4 rounded-lg bg-success/5 border border-success/20 mb-4">
                  <p className="text-muted-foreground font-medium">🔐 Bank-level Encryption</p>
                  <p className="text-muted-foreground text-sm mt-1">
                    Your files are stored securely using industry-standard AES-256 encryption.
                  </p>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  We use modern cloud infrastructure to ensure high availability and data protection. 
                  We implement appropriate technical and organizational measures to protect your personal 
                  data against unauthorized access, alteration, or destruction.
                </p>
              </section>

              {/* Section 6 */}
              <section>
                <h2 className="text-2xl font-bold mb-4">6. Data Sharing</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We do not sell your personal information. We may share your information with:
                </p>
                <ul className="space-y-3 ml-4">
                  {[
                    'Service providers who assist in our operations',
                    'Law enforcement when required by law',
                    'Other users when you choose to share files',
                    'Business partners with your explicit consent',
                  ].map((item, i) => (
                    <li key={i} className="flex gap-3 text-muted-foreground">
                      <span className="text-primary font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* Section 7 */}
              <section>
                <h2 className="text-2xl font-bold mb-4">7. Your Rights</h2>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  {[
                    { title: 'Access', desc: 'Get a copy of your data anytime' },
                    { title: 'Correction', desc: 'Fix any inaccurate information' },
                    { title: 'Deletion', desc: 'Delete your account and data' },
                    { title: 'Export', desc: 'Download all your files' },
                  ].map((right, i) => (
                    <div key={i} className="p-3 rounded-lg bg-muted/50 border">
                      <p className="font-medium text-foreground">{right.title}</p>
                      <p className="text-sm text-muted-foreground">{right.desc}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Section 8 */}
              <section>
                <h2 className="text-2xl font-bold mb-4">8. Cookies</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We use cookies and similar technologies to enhance your experience, analyze usage, 
                  and assist in our marketing efforts. You can control cookie preferences through your 
                  browser settings.
                </p>
              </section>

              {/* Section 9 */}
              <section>
                <h2 className="text-2xl font-bold mb-4">9. Children&apos;s Privacy</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Zonix Cloud is not intended for children under 13 years of age. We do not knowingly 
                  collect personal information from children under 13.
                </p>
              </section>

              {/* Section 10 */}
              <section>
                <h2 className="text-2xl font-bold mb-4">10. Contact Us</h2>
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <p className="text-muted-foreground">
                    If you have questions about this Privacy Policy, please contact us at{' '}
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
                  <Button>I Agree & Continue</Button>
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
