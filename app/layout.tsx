import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import { COMPANY_DOMAIN } from '@/lib/config'
import './globals.css'

const _geist = Geist({ subsets: ['latin'] })
const _geistMono = Geist_Mono({ subsets: ['latin'] })

const siteUrl = `https://${COMPANY_DOMAIN}`

export const metadata: Metadata = {
  title: {
    default: 'Zonix Cloud - Secure Cloud Storage & AI-Powered File Management',
    template: '%s | Zonix Cloud'
  },
  description: 'Zonix Cloud: Free 5GB cloud storage, AI-powered file organization, team collaboration. Student tier 20GB free (2 months). Pro 250GB ($2.50/mo). Business 1TB ($5/mo). Enterprise solutions available.',
  keywords: [
    'cloud storage',
    'file sharing',
    'AI file management',
    'secure cloud storage',
    'team collaboration',
    'file organization',
    'cloud backup',
    'file sync',
    'online storage',
    'Zonix Cloud'
  ],
  authors: [{ name: 'Zonix Cloud', url: siteUrl }],
  creator: 'Zonix Cloud',
  publisher: 'Zonix Cloud',
  formatDetection: {
    email: false,
    telephone: false,
    address: false,
  },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
        sizes: '32x32',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
        sizes: '32x32',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: [
      {
        url: '/apple-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
    shortcut: '/favicon.ico',
  },
  manifest: '/site.webmanifest',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'Zonix Cloud',
    title: 'Zonix Cloud - Secure Cloud Storage & AI-Powered File Management',
    description: 'Fast, secure, and intelligent cloud storage. Free 5GB storage with AI-powered file organization and team collaboration features.',
    images: [
      {
        url: `${siteUrl}/og-image-1200x630.jpg`,
        width: 1200,
        height: 630,
        alt: 'Zonix Cloud - Cloud Storage Platform',
        type: 'image/jpeg',
      },
      {
        url: `${siteUrl}/og-image-800x420.jpg`,
        width: 800,
        height: 420,
        alt: 'Zonix Cloud - Cloud Storage Platform',
        type: 'image/jpeg',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Zonix Cloud - Secure Cloud Storage & AI-Powered File Management',
    description: 'Fast, secure, and intelligent cloud storage. Free 5GB + AI file organization.',
    creator: '@zonixcloud',
    images: [`${siteUrl}/og-image-1200x630.jpg`],
  },
  alternates: {
    canonical: siteUrl,
    languages: {
      'en-US': `${siteUrl}/en-US`,
    },
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1,
    },
  },
  category: 'Technology',
  classification: 'Cloud Storage Service',
  generator: 'Zonix Cloud Platform',
  referrer: 'strict-origin-when-cross-origin',
}

export const viewport: Viewport = {
  themeColor: '#0078D4',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Zonix Cloud',
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    description: 'Secure cloud storage with AI-powered file management and team collaboration',
    sameAs: [
      'https://twitter.com/zonixcloud',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      email: 'support@zonix.me',
      url: `${siteUrl}/support`,
    },
    founder: {
      '@type': 'Person',
      name: 'Zonix Team',
    },
  }

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-sans antialiased">
        {children}
        <Toaster position="bottom-right" />
      </body>
    </html>
  )
}
