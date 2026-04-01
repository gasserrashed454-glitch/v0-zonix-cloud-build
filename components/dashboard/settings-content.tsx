'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  User as UserIcon, 
  Bell, 
  Shield, 
  Trash2, 
  LogOut,
  Save,
  Key,
  Mail
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '@/lib/types'

interface SettingsContentProps {
  user: User
  profile: Profile | null
}

export function SettingsContent({ user, profile }: SettingsContentProps) {
  const router = useRouter()
  const supabase = createClient()
  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [isSaving, setIsSaving] = useState(false)
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)

  const handleSaveProfile = async () => {
    setIsSaving(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: fullName }),
      })

      if (res.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error('Save error:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const handleDeleteAccount = () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      // In production, this would call an API to delete the account
      alert('Account deletion would be processed. Contact support for help.')
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserIcon className="h-5 w-5" />
            Profile
          </CardTitle>
          <CardDescription>Update your personal information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="flex gap-2">
              <Input id="email" value={user.email || ''} disabled />
              <Badge variant="secondary">
                {user.email_confirmed_at ? 'Verified' : 'Unverified'}
              </Badge>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your name"
            />
          </div>
          <Button onClick={handleSaveProfile} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
          <CardDescription>Configure how you receive notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive email updates about your account
              </p>
            </div>
            <Switch
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Storage Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when storage is running low
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security
          </CardTitle>
          <CardDescription>Manage your security settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Two-Factor Authentication</Label>
              <p className="text-sm text-muted-foreground">
                Add an extra layer of security
              </p>
            </div>
            <Switch
              checked={twoFactorEnabled}
              onCheckedChange={setTwoFactorEnabled}
            />
          </div>
          <Separator />
          <div className="space-y-2">
            <Label>Change Password</Label>
            <Button variant="outline">
              <Key className="h-4 w-4 mr-2" />
              Update Password
            </Button>
          </div>
          <Separator />
          <div className="space-y-2">
            <Label>Connected Accounts</Label>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Mail className="h-4 w-4 mr-2" />
                Connect Google
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>Irreversible actions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-destructive/5 rounded-lg">
            <div>
              <p className="font-medium">Sign Out</p>
              <p className="text-sm text-muted-foreground">
                Sign out of your account on this device
              </p>
            </div>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between p-4 bg-destructive/5 rounded-lg">
            <div>
              <p className="font-medium text-destructive">Delete Account</p>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all data
              </p>
            </div>
            <Button variant="destructive" onClick={handleDeleteAccount}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
