'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'
import { AlertCircle, CheckCircle2, Copy, Download, Shield } from 'lucide-react'

export function TwoFactorAuthSettings() {
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState<'setup' | 'verify' | 'complete'>('setup')
  const [qrCode, setQrCode] = useState('')
  const [secret, setSecret] = useState('')
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [verificationCode, setVerificationCode] = useState('')
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const generateSetup = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/2fa/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate' }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error)
      }

      setQrCode(data.qrCode)
      setSecret(data.secret)
      setBackupCodes(data.backupCodes)
      setStep('verify')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to generate 2FA setup')
    } finally {
      setIsLoading(false)
    }
  }

  const verify = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast.error('Please enter a valid 6-digit code')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          secret,
          code: verificationCode,
          backupCodes,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error)
      }

      toast.success('Two-factor authentication enabled!')
      setStep('complete')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Verification failed')
    } finally {
      setIsLoading(false)
    }
  }

  const copyBackupCode = (code: string, index: number) => {
    navigator.clipboard.writeText(code)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const downloadBackupCodes = () => {
    const content = `Zonix Cloud 2FA Backup Codes\n\n${backupCodes.join('\n')}\n\nStore these codes in a safe place. Each code can be used once if you lose access to your authenticator app.`
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = '2fa-backup-codes.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Two-Factor Authentication
        </CardTitle>
        <CardDescription>Add an extra layer of security to your account</CardDescription>
      </CardHeader>
      <CardContent>
        {step === 'setup' && (
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>What is 2FA?</AlertTitle>
              <AlertDescription>
                Two-factor authentication adds a second step to sign in. You&apos;ll need both your password and a code from your authenticator app.
              </AlertDescription>
            </Alert>
            <div className="bg-muted p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Required:</h3>
              <ul className="text-sm space-y-1">
                <li>Authenticator app (Google Authenticator, Authy, Microsoft Authenticator, etc.)</li>
                <li>A device to scan the QR code</li>
              </ul>
            </div>
            <Button onClick={generateSetup} disabled={isLoading} className="w-full">
              {isLoading ? <Spinner className="mr-2" /> : null}
              Set Up Two-Factor Authentication
            </Button>
          </div>
        )}

        {step === 'verify' && (
          <div className="space-y-4">
            <Tabs defaultValue="app" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="app">Authenticator App</TabsTrigger>
                <TabsTrigger value="backup">Backup Codes</TabsTrigger>
              </TabsList>

              <TabsContent value="app" className="space-y-4">
                <div className="space-y-2">
                  <Label>1. Scan QR Code</Label>
                  {qrCode && (
                    <div className="flex justify-center p-4 bg-white rounded">
                      <img src={qrCode} alt="2FA QR Code" className="h-48 w-48" />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Or enter this key manually:</Label>
                  <code className="block p-3 bg-muted rounded text-sm font-mono break-all">
                    {secret}
                  </code>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="verification-code">2. Enter verification code</Label>
                  <Input
                    id="verification-code"
                    placeholder="000000"
                    maxLength="6"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                    className="text-center text-2xl tracking-widest"
                  />
                </div>

                <Button onClick={verify} disabled={isLoading} className="w-full">
                  {isLoading ? <Spinner className="mr-2" /> : null}
                  Verify & Enable 2FA
                </Button>
              </TabsContent>

              <TabsContent value="backup" className="space-y-4">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Save Your Backup Codes</AlertTitle>
                  <AlertDescription>
                    Store these codes safely. You can use them to access your account if you lose your authenticator app.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  {backupCodes.map((code, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded">
                      <code className="font-mono text-sm">{code}</code>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyBackupCode(code, index)}
                      >
                        <Copy className={`h-4 w-4 ${copiedIndex === index ? 'text-green-600' : ''}`} />
                      </Button>
                    </div>
                  ))}
                </div>

                <Button onClick={downloadBackupCodes} variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Download Backup Codes
                </Button>

                <div className="space-y-2">
                  <Label htmlFor="verification-code">Enter verification code from authenticator app</Label>
                  <Input
                    id="verification-code"
                    placeholder="000000"
                    maxLength="6"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                    className="text-center text-2xl tracking-widest"
                  />
                </div>

                <Button onClick={verify} disabled={isLoading} className="w-full">
                  {isLoading ? <Spinner className="mr-2" /> : null}
                  Verify & Enable 2FA
                </Button>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {step === 'complete' && (
          <div className="space-y-4 text-center">
            <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto" />
            <div>
              <h3 className="font-semibold text-lg">2FA Enabled!</h3>
              <p className="text-sm text-muted-foreground">
                Your account is now protected with two-factor authentication.
              </p>
            </div>
            <Button onClick={() => setStep('setup')} className="w-full">
              Done
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
