'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, Shield, Lock } from 'lucide-react'
import { toast } from 'sonner'

export default function StorageSettingsPage() {
  const [malwareScanEnabled, setMalwareScanEnabled] = useState(true)
  const [passwordProtectionEnabled, setPasswordProtectionEnabled] = useState(false)
  const [storagePassword, setStoragePassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const handleSaveSettings = async () => {
    if (passwordProtectionEnabled && storagePassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (passwordProtectionEnabled && storagePassword.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }

    setIsSaving(true)
    try {
      const res = await fetch('/api/settings/storage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          malware_scan_enabled: malwareScanEnabled,
          password_protection_enabled: passwordProtectionEnabled,
          storage_password: passwordProtectionEnabled ? storagePassword : null,
        }),
      })

      if (res.ok) {
        toast.success('Storage settings saved successfully')
        setStoragePassword('')
        setConfirmPassword('')
      } else {
        toast.error('Failed to save settings')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Storage Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your storage security and access settings
        </p>
      </div>

      {/* Malware Scanning */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Malware Scanning
          </CardTitle>
          <CardDescription>
            Automatically scan uploaded files for malware and malicious content
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="malware-scan" className="text-base">
                Enable Malware Detection
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Files will be scanned for threats before being stored. This may add a slight delay to uploads.
              </p>
            </div>
            <Switch
              id="malware-scan"
              checked={malwareScanEnabled}
              onCheckedChange={setMalwareScanEnabled}
            />
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Note</AlertTitle>
            <AlertDescription>
              While we use advanced scanning tools, no security system is 100% foolproof. 
              Always maintain backups of important files.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Password Protection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Storage Access Password
          </CardTitle>
          <CardDescription>
            Require a password to access your Zonix Cloud storage
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <Label htmlFor="password-protection" className="text-base">
                Enable Password Protection
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                You will need to enter your password each time you access your storage on a new device.
              </p>
            </div>
            <Switch
              id="password-protection"
              checked={passwordProtectionEnabled}
              onCheckedChange={setPasswordProtectionEnabled}
            />
          </div>

          {passwordProtectionEnabled && (
            <div className="space-y-4 pt-4 border-t">
              <div className="space-y-2">
                <Label htmlFor="storage-password">New Password</Label>
                <Input
                  id="storage-password"
                  type="password"
                  placeholder="Enter at least 8 characters"
                  value={storagePassword}
                  onChange={(e) => setStoragePassword(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Minimum 8 characters recommended
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Important</AlertTitle>
                <AlertDescription>
                  If you forget this password, you will need to reset it via email. Store it in a secure location.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSaveSettings} disabled={isSaving} size="lg">
          {isSaving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  )
}
