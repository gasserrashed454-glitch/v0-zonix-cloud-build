'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'
import { sendVerificationCode, signUp } from '../actions'
import { Mail, Lock, User, ArrowRight, CheckCircle } from 'lucide-react'

type Step = 'email' | 'verify' | 'details'

export default function SignUpPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('email')
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [expectedCode, setExpectedCode] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [showDevCode, setShowDevCode] = useState(false)

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    const result = await sendVerificationCode(email, 'signup')
    
    if (result.success && result.code) {
      setExpectedCode(result.code)
      setStep('verify')
      const isDevMode = (result as { devMode?: boolean }).devMode === true
      if (isDevMode) {
        setShowDevCode(true)
        toast.success(`Your verification code is: ${result.code}`, { duration: 15000 })
      } else {
        setShowDevCode(false)
        toast.success('Verification code sent to your email')
      }
    } else {
      toast.error(result.error || 'Failed to send verification code')
    }
    setIsLoading(false)
  }

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault()
    if (verificationCode === expectedCode) {
      setStep('details')
      toast.success('Email verified!')
    } else {
      toast.error('Invalid verification code')
    }
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData()
    formData.append('email', email)
    formData.append('password', password)
    formData.append('fullName', fullName)
    formData.append('verificationCode', verificationCode)
    formData.append('expectedCode', expectedCode)

    const result = await signUp(formData)
    
    if (result?.error) {
      toast.error(result.error)
    } else if (result?.success) {
      toast.success('Account created successfully!')
      router.push('/dashboard')
    }
    setIsLoading(false)
  }

  return (
    <Card className="w-full max-w-md shadow-lg border-border/50">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-semibold tracking-tight">Create an account</CardTitle>
        <CardDescription>
          {step === 'email' && 'Enter your email to get started'}
          {step === 'verify' && 'Enter the code sent to your email'}
          {step === 'details' && 'Complete your account setup'}
        </CardDescription>
      </CardHeader>

      {/* Step indicators */}
      <div className="px-6 pb-4">
        <div className="flex items-center justify-center gap-2">
          {(['email', 'verify', 'details'] as const).map((s, i) => (
            <div key={s} className="flex items-center">
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  step === s
                    ? 'bg-primary text-primary-foreground'
                    : ['verify', 'details'].indexOf(step) > ['email', 'verify', 'details'].indexOf(s)
                    ? 'bg-primary/20 text-primary'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {['verify', 'details'].indexOf(step) > ['email', 'verify', 'details'].indexOf(s) ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  i + 1
                )}
              </div>
              {i < 2 && (
                <div
                  className={`w-12 h-0.5 mx-1 ${
                    ['verify', 'details'].indexOf(step) > i ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {step === 'email' && (
        <form onSubmit={handleSendCode}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Spinner className="mr-2" />
                  Sending code...
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      )}

      {step === 'verify' && (
        <form onSubmit={handleVerifyCode}>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              We sent a 6-digit code to <span className="font-medium text-foreground">{email}</span>
            </p>
            {showDevCode && expectedCode && (
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">Dev Mode - Your code:</p>
                <p className="text-2xl font-mono font-bold text-primary tracking-widest">{expectedCode}</p>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="code">Verification code</Label>
              <Input
                id="code"
                type="text"
                placeholder="123456"
                className="text-center text-2xl tracking-widest font-mono"
                maxLength={6}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                required
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              className="w-full text-sm"
              onClick={handleSendCode}
              disabled={isLoading}
            >
              Didn&apos;t receive the code? Resend
            </Button>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={verificationCode.length !== 6}>
              Verify email
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </form>
      )}

      {step === 'details' && (
        <form onSubmit={handleSignUp}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  className="pl-10"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  autoComplete="name"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a strong password"
                  className="pl-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
              </div>
              <p className="text-xs text-muted-foreground">Must be at least 8 characters</p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Spinner className="mr-2" />
                  Creating account...
                </>
              ) : (
                <>
                  Create account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              By creating an account, you agree to our{' '}
              <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link>
              {' '}and{' '}
              <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
            </p>
          </CardFooter>
        </form>
      )}
    </Card>
  )
}
