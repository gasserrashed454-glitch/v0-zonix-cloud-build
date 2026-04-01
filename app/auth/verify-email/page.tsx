import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Mail, ArrowRight } from 'lucide-react'

export default function VerifyEmailPage() {
  return (
    <Card className="w-full max-w-md shadow-lg border-border/50">
      <CardHeader className="space-y-1 text-center">
        <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
          <Mail className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-2xl font-semibold tracking-tight">Check your email</CardTitle>
        <CardDescription>
          We&apos;ve sent you a confirmation link to verify your account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
          <p>Click the link in your email to complete your registration. The link will expire in 24 hours.</p>
        </div>
        <div className="space-y-2">
          <Button asChild className="w-full">
            <Link href="/auth/login">
              Continue to sign in
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            Didn&apos;t receive the email? Check your spam folder or{' '}
            <Link href="/auth/signup" className="text-primary hover:underline">
              try again
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
