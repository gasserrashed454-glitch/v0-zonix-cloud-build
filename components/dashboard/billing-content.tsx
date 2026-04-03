'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  CreditCard, 
  Download, 
  ArrowUpRight, 
  Cloud, 
  Sparkles, 
  GraduationCap,
  Building2,
  Check
} from 'lucide-react'
import type { Profile, Invoice } from '@/lib/types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface BillingContentProps {
  profile: Profile | null
  invoices: Invoice[]
}

const tierInfo = {
  free: {
    name: 'Free',
    icon: Cloud,
    color: 'text-muted-foreground',
    storage: '5 GB',
    uploadLimit: '2 GB',
  },
  student: {
    name: 'Student',
    icon: GraduationCap,
    color: 'text-green-600',
    storage: '50 GB',
    uploadLimit: '20 GB',
  },
  premium: {
    name: 'Premium',
    icon: Sparkles,
    color: 'text-primary',
    storage: '100 GB',
    uploadLimit: '50 GB',
  },
  enterprise: {
    name: 'Enterprise',
    icon: Building2,
    color: 'text-purple-600',
    storage: 'Unlimited',
    uploadLimit: 'Unlimited',
  },
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function BillingContent({ profile, invoices }: BillingContentProps) {
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false)

  if (!profile) {
    return <div className="p-8">Loading...</div>
  }

  const tier = profile.tier as keyof typeof tierInfo
  const currentTier = tierInfo[tier]
  const TierIcon = currentTier.icon
  const storagePercent = (profile.storage_used / profile.storage_limit) * 100

  const handleUpgrade = async (newTier: string) => {
    if (newTier === 'enterprise') {
      window.location.href = 'mailto:gassetrashed454@gmail.com?subject=Zonix Cloud Enterprise Inquiry'
      return
    }
    
    // In a real app, this would integrate with Stripe
    alert(`Upgrade to ${newTier} would trigger Stripe checkout. This is a demo.`)
    setUpgradeDialogOpen(false)
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Billing & Subscription</h1>
        <p className="text-muted-foreground">Manage your subscription and billing details</p>
      </div>

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TierIcon className={`h-5 w-5 ${currentTier.color}`} />
            Current Plan
          </CardTitle>
          <CardDescription>Your active subscription details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">{currentTier.name}</span>
                <Badge variant={tier === 'free' ? 'secondary' : 'default'}>
                  {tier === 'premium' ? '$4.99/mo' : tier === 'free' ? 'Free' : 'Active'}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {currentTier.storage} storage, {currentTier.uploadLimit} upload limit
              </p>
            </div>
            <Dialog open={upgradeDialogOpen} onOpenChange={setUpgradeDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  {tier === 'enterprise' ? 'Manage Plan' : 'Upgrade Plan'}
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Change Your Plan</DialogTitle>
                  <DialogDescription>
                    Select a plan that fits your needs
                  </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  {Object.entries(tierInfo).map(([key, info]) => {
                    const Icon = info.icon
                    const isCurrentTier = key === tier
                    return (
                      <div
                        key={key}
                        className={`p-4 rounded-lg border-2 ${
                          isCurrentTier ? 'border-primary bg-primary/5' : 'border-border'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Icon className={`h-5 w-5 ${info.color}`} />
                          <span className="font-semibold">{info.name}</span>
                          {isCurrentTier && (
                            <Badge variant="outline" className="ml-auto">Current</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {info.storage} storage
                        </p>
                        <Button
                          className="w-full"
                          variant={isCurrentTier ? 'outline' : 'default'}
                          disabled={isCurrentTier}
                          onClick={() => handleUpgrade(key)}
                        >
                          {isCurrentTier ? 'Current Plan' : key === 'enterprise' ? 'Contact Sales' : 'Select'}
                        </Button>
                      </div>
                    )
                  })}
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Storage Usage */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Storage Used</span>
              <span className="font-medium">
                {formatBytes(profile.storage_used)} / {formatBytes(profile.storage_limit)}
              </span>
            </div>
            <Progress value={storagePercent} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {storagePercent.toFixed(1)}% of your storage is used
            </p>
          </div>

          {/* AI Usage */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>AI Uses Today</span>
              <span className="font-medium">
                {profile.ai_uses_today} / {profile.ai_daily_limit === 999999 ? 'Unlimited' : profile.ai_daily_limit}
              </span>
            </div>
            {profile.ai_daily_limit !== 999999 && (
              <Progress 
                value={(profile.ai_uses_today / profile.ai_daily_limit) * 100} 
                className="h-2" 
              />
            )}
          </div>

          {/* Features */}
          <div className="pt-4 border-t">
            <h4 className="font-medium mb-3">Plan Features</h4>
            <div className="grid grid-cols-2 gap-2">
              {[
                'File storage & management',
                'File sharing',
                tier !== 'free' ? 'AI File Organization' : 'Basic AI (50/day)',
                tier === 'premium' || tier === 'enterprise' ? 'AI Task Automation' : '',
                tier !== 'free' ? 'Priority support' : 'Community support',
                tier === 'enterprise' ? 'Custom integrations' : '',
              ].filter(Boolean).map((feature) => (
                <div key={feature} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Method */}
      {tier === 'premium' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Method
            </CardTitle>
            <CardDescription>Manage your payment details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-8 w-12 bg-gradient-to-r from-blue-600 to-blue-800 rounded flex items-center justify-center text-white text-xs font-bold">
                  VISA
                </div>
                <div>
                  <p className="font-medium">Visa ending in 4242</p>
                  <p className="text-sm text-muted-foreground">Expires 12/25</p>
                </div>
              </div>
              <Button variant="outline" size="sm">Update</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>View and download past invoices</CardDescription>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No billing history yet
            </p>
          ) : (
            <div className="space-y-3">
              {invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                >
                  <div>
                    <p className="font-medium">${invoice.amount.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(invoice.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={invoice.status === 'paid' ? 'default' : 'secondary'}>
                      {invoice.status}
                    </Badge>
                    <Button variant="ghost" size="icon">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Student Verification */}
      {tier === 'free' && (
        <Card className="border-green-200 bg-green-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-green-600" />
              Are you a student?
            </CardTitle>
            <CardDescription>
              Get 50 GB storage free with student verification
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="border-green-600 text-green-700 hover:bg-green-100">
              Verify Student Status
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
