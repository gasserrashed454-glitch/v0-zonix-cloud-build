import { ZonixLogo } from '@/components/zonix-logo'
import Link from 'next/link'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-secondary/30">
      <header className="p-6">
        <Link href="/">
          <ZonixLogo size="md" />
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center p-6">
        {children}
      </main>
      <footer className="p-6 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Zonix Cloud. All rights reserved.</p>
      </footer>
    </div>
  )
}
