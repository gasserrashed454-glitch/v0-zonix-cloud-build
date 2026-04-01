import Link from 'next/link'
import { ZonixLogo } from '@/components/zonix-logo'
import { Button } from '@/components/ui/button'

export const metadata = {
  title: 'Privacy Policy | Zonix Cloud',
  description: 'Privacy Policy for Zonix Cloud storage platform',
}

export default function PrivacyPage() {
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
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: April 1, 2026</p>

        <div className="prose prose-slate max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              At Zonix Cloud, we take your privacy seriously. This Privacy Policy explains how we 
              collect, use, disclose, and safeguard your information when you use our cloud storage 
              service. Please read this policy carefully to understand our practices regarding your 
              personal data.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We collect information you provide directly to us, including:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Account information (name, email address, password)</li>
              <li>Profile information (avatar, display name)</li>
              <li>Files and content you upload to our service</li>
              <li>Payment information for premium subscriptions</li>
              <li>Communications with our support team</li>
              <li>Student verification documents (for student tier)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Automatically Collected Information</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              When you use our service, we automatically collect:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Device information (browser type, operating system)</li>
              <li>Log data (IP address, access times, pages viewed)</li>
              <li>Usage patterns and feature interactions</li>
              <li>Location data (approximate, based on IP address)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. How We Use Your Information</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Provide, maintain, and improve our services</li>
              <li>Process transactions and send related information</li>
              <li>Send technical notices and support messages</li>
              <li>Respond to your comments and questions</li>
              <li>Detect and prevent fraud and abuse</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Data Storage and Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              Your files are stored securely using industry-standard encryption. We use Azure Storage 
              infrastructure to ensure high availability and data protection. We implement appropriate 
              technical and organizational measures to protect your personal data against unauthorized 
              access, alteration, or destruction.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Data Sharing</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We do not sell your personal information. We may share your information with:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Service providers who assist in our operations</li>
              <li>Law enforcement when required by law</li>
              <li>Other users when you choose to share files</li>
              <li>Business partners with your consent</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Your Rights</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              You have the right to:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Access and download your personal data</li>
              <li>Correct inaccurate information</li>
              <li>Delete your account and associated data</li>
              <li>Object to processing of your data</li>
              <li>Export your files at any time</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Cookies</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use cookies and similar technologies to enhance your experience, analyze usage, 
              and assist in our marketing efforts. You can control cookie preferences through your 
              browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Children&apos;s Privacy</h2>
            <p className="text-muted-foreground leading-relaxed">
              Zonix Cloud is not intended for children under 13 years of age. We do not knowingly 
              collect personal information from children under 13.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Changes to This Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any changes 
              by posting the new policy on this page and updating the &quot;Last updated&quot; date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">11. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have questions about this Privacy Policy, please contact us at{' '}
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
