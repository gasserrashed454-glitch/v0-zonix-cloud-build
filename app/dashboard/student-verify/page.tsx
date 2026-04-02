'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'
import { sendVerificationCode, verifyStudentEmail } from '@/app/auth/actions'
import { GraduationCap, Mail, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

type Step = 'email' | 'verify' | 'pending' | 'success'

// Educational domains - includes country-specific TLDs that are education-focused
const eduDomains = [
  // Generic educational
  '.edu', '.edu.', '.ac.', '.school', '.university',
  // Country-specific educational  
  '.ac.uk', '.edu.au', '.edu.cn', '.ac.jp', '.edu.sg', '.edu.my', '.edu.in', '.edu.pk',
  '.edu.br', '.edu.mx', '.edu.ar', '.edu.co', '.edu.pe', '.edu.ve', '.edu.ec',
  '.edu.sa', '.edu.eg', '.edu.ng', '.edu.za', '.edu.ke', '.edu.gh',
  '.ac.nz', '.ac.kr', '.ac.th', '.ac.id', '.edu.ph', '.edu.vn', '.edu.tw', '.edu.hk',
  '.edu.tr', '.edu.pl', '.edu.ru', '.edu.ua', '.ac.il', '.ac.ir',
  '.edu.es', '.edu.pt', '.edu.it', '.edu.fr', '.edu.de', '.edu.nl', '.edu.be',
  // Country TLDs (for countries where students commonly use country domains)
  '.ae', '.qa', '.kw', '.bh', '.om', '.jo', '.lb', '.sy', '.iq', '.ps', '.ye',
  '.sa', '.eg', '.ma', '.dz', '.tn', '.ly', '.sd',
]

export default function StudentVerifyPage() {
  const [step, setStep] = useState<Step>('email')
  const [isLoading, setIsLoading] = useState(false)
  const [studentEmail, setStudentEmail] = useState('')
  const [expectedCode, setExpectedCode] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [showDevCode, setShowDevCode] = useState(false)

  const isValidEduEmail = (email: string) => {
    const domain = email.toLowerCase()
    return eduDomains.some(edu => domain.includes(edu))
  }

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault()
    
    if (!isValidEduEmail(studentEmail)) {
      toast.error('Please enter a valid school/university email address')
      return
    }
    
    setIsLoading(true)

    const result = await sendVerificationCode(studentEmail, 'student')
    
    if (result.success && result.code) {
      setExpectedCode(result.code)
      setStep('verify')
      const isDevMode = (result as { devMode?: boolean }).devMode === true
      if (isDevMode) {
        setShowDevCode(true)
        toast.success(`Your verification code is: ${result.code}`, { duration: 15000 })
      } else {
        toast.success('Verification code sent to your school email')
      }
    } else if ((result as { rateLimited?: boolean }).rateLimited) {
      toast.error(result.error || 'Too many attempts. Please try again later.', { duration: 10000 })
    } else {
      toast.error(result.error || 'Failed to send verification code')
    }
    setIsLoading(false)
  }

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData()
    formData.append('studentEmail', studentEmail)
    formData.append('verificationCode', verificationCode)
    formData.append('expectedCode', expectedCode)

    const result = await verifyStudentEmail(formData)
    
    if (result.success) {
      setStep('pending')
      toast.success('Verification submitted! Awaiting approval.')
    } else {
      toast.error(result.error || 'Verification failed')
    }
    setIsLoading(false)
  }

  return (
    <div className="flex-1 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Student Verification</h1>
          <p className="text-muted-foreground">
            Verify your student status to get 50GB storage and 200 AI requests daily - completely free!
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {step === 'email' && 'Enter Your School Email'}
              {step === 'verify' && 'Verify Your Email'}
              {step === 'pending' && 'Verification Pending'}
              {step === 'success' && 'Verification Complete'}
            </CardTitle>
            <CardDescription>
              {step === 'email' && 'Use your official school or university email address'}
              {step === 'verify' && 'Enter the code sent to your school email'}
              {step === 'pending' && 'Your application is being reviewed by our support team'}
              {step === 'success' && 'Congratulations! You now have student benefits'}
            </CardDescription>
          </CardHeader>

          {step === 'email' && (
            <form onSubmit={handleSendCode}>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Use your school/university email (.edu, .ac.uk, etc.) or a country domain email (.ae, .sa, .eg, etc.) to verify your student status.
                  </AlertDescription>
                </Alert>
                <div className="space-y-2">
                  <Label htmlFor="studentEmail">School Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="studentEmail"
                      type="email"
                      placeholder="you@university.edu"
                      className="pl-10"
                      value={studentEmail}
                      onChange={(e) => setStudentEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={isLoading || !studentEmail}>
                  {isLoading ? (
                    <>
                      <Spinner className="mr-2" />
                      Sending code...
                    </>
                  ) : (
                    <>
                      Send Verification Code
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          )}

          {step === 'verify' && (
            <form onSubmit={handleVerifyCode}>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground text-center">
                  We sent a 6-digit code to <span className="font-medium text-foreground">{studentEmail}</span>
                </p>
                {showDevCode && expectedCode && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Dev Mode - Your code:</p>
                    <p className="text-2xl font-mono font-bold text-green-600 tracking-widest">{expectedCode}</p>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="code">Verification Code</Label>
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
                <Button type="submit" className="w-full" disabled={verificationCode.length !== 6 || isLoading}>
                  {isLoading ? (
                    <>
                      <Spinner className="mr-2" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      Verify & Submit Application
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          )}

          {step === 'pending' && (
            <CardContent className="text-center py-8">
              <div className="h-16 w-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="h-8 w-8 text-amber-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Application Submitted</h3>
              <p className="text-muted-foreground mb-4">
                Our support team will review your student verification within 24-48 hours.
                You&apos;ll receive an email once your status is approved.
              </p>
              <Button variant="outline" onClick={() => window.location.href = '/dashboard'}>
                Return to Dashboard
              </Button>
            </CardContent>
          )}

          {step === 'success' && (
            <CardContent className="text-center py-8">
              <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">You&apos;re All Set!</h3>
              <p className="text-muted-foreground mb-4">
                Your student status has been verified. Enjoy 50GB storage and 200 AI requests daily!
              </p>
              <Button onClick={() => window.location.href = '/dashboard'}>
                Go to Dashboard
              </Button>
            </CardContent>
          )}
        </Card>

        {/* Benefits list */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-muted/50 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">50 GB</div>
            <div className="text-sm text-muted-foreground">Storage Space</div>
          </div>
          <div className="p-4 bg-muted/50 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">200/day</div>
            <div className="text-sm text-muted-foreground">AI Requests</div>
          </div>
          <div className="p-4 bg-muted/50 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">20 GB</div>
            <div className="text-sm text-muted-foreground">Upload Limit</div>
          </div>
        </div>
      </div>
    </div>
  )
}
