'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react'

export function ChangePasswordForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPasswords, setShowPasswords] = useState(false)
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState<string[]>([])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors([])
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.errors && Array.isArray(data.errors)) {
          setErrors(data.errors)
          toast.error('Password does not meet requirements')
        } else {
          toast.error(data.error || 'Failed to change password')
        }
        return
      }

      toast.success('Password changed successfully')
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error) {
      console.error('[v0] Password change error:', error)
      toast.error('Failed to change password')
    } finally {
      setIsLoading(false)
    }
  }

  const passwordStrength = () => {
    const pwd = formData.newPassword
    let strength = 0
    if (pwd.length >= 8) strength++
    if (/[A-Z]/.test(pwd)) strength++
    if (/[a-z]/.test(pwd)) strength++
    if (/[0-9]/.test(pwd)) strength++
    if (/[!@#$%^&*]/.test(pwd)) strength++
    return strength
  }

  const strength = passwordStrength()
  const strengthColor = strength <= 2 ? 'bg-red-500' : strength === 3 ? 'bg-yellow-500' : 'bg-green-500'

  return (
    <Card>
      <CardHeader>
        <CardTitle>Change Password</CardTitle>
        <CardDescription>Update your account password securely</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Current Password */}
          <div className="space-y-2">
            <Label htmlFor="current-password">Current Password</Label>
            <div className="relative">
              <Input
                id="current-password"
                type={showPasswords ? 'text' : 'password'}
                placeholder="Enter current password"
                value={formData.currentPassword}
                onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                required
              />
              <button
                type="button"
                onClick={() => setShowPasswords(!showPasswords)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showPasswords ? 'text' : 'password'}
                placeholder="Enter new password"
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                required
              />
              <button
                type="button"
                onClick={() => setShowPasswords(!showPasswords)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {/* Password Strength Indicator */}
            {formData.newPassword && (
              <div className="space-y-1">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full ${i <= strength ? strengthColor : 'bg-muted'}`}
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  {strength <= 2 ? 'Weak' : strength === 3 ? 'Fair' : 'Strong'}
                </p>
              </div>
            )}

            {/* Requirements */}
            <div className="text-xs space-y-1">
              <p className={formData.newPassword.length >= 8 ? 'text-green-600' : 'text-muted-foreground'}>
                {formData.newPassword.length >= 8 ? '✓' : '○'} At least 8 characters
              </p>
              <p className={/[A-Z]/.test(formData.newPassword) ? 'text-green-600' : 'text-muted-foreground'}>
                {/[A-Z]/.test(formData.newPassword) ? '✓' : '○'} Uppercase letter
              </p>
              <p className={/[a-z]/.test(formData.newPassword) ? 'text-green-600' : 'text-muted-foreground'}>
                {/[a-z]/.test(formData.newPassword) ? '✓' : '○'} Lowercase letter
              </p>
              <p className={/[0-9]/.test(formData.newPassword) ? 'text-green-600' : 'text-muted-foreground'}>
                {/[0-9]/.test(formData.newPassword) ? '✓' : '○'} Number
              </p>
              <p className={/[!@#$%^&*]/.test(formData.newPassword) ? 'text-green-600' : 'text-muted-foreground'}>
                {/[!@#$%^&*]/.test(formData.newPassword) ? '✓' : '○'} Special character (!@#$%^&*)
              </p>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <Input
              id="confirm-password"
              type={showPasswords ? 'text' : 'password'}
              placeholder="Confirm new password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
            />
            {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
              <p className="text-xs text-red-600">Passwords do not match</p>
            )}
            {formData.confirmPassword && formData.newPassword === formData.confirmPassword && (
              <p className="text-xs text-green-600">Passwords match</p>
            )}
          </div>

          {/* Error Messages */}
          {errors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <ul className="list-disc list-inside space-y-1">
                  {errors.map((error, i) => <li key={i}>{error}</li>)}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Spinner className="mr-2" />
                Changing Password...
              </>
            ) : (
              'Change Password'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
