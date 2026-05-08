import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { formatBytes } from '@/lib/types'
import { HardDrive, AlertCircle } from 'lucide-react'

export default async function StoragePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) {
    redirect('/auth/login')
  }

  const storagePercent = Math.round((profile.storage_used / profile.storage_limit) * 100)
  const isNearLimit = storagePercent >= 80

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
          <HardDrive className="h-6 w-6" />
          Storage
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your storage and upgrade when needed
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Storage Usage</CardTitle>
          <CardDescription>You are using {storagePercent}% of your available storage</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isNearLimit && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
              <AlertCircle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-900 text-sm">Storage limit approaching</p>
                <p className="text-xs text-yellow-700 mt-1">Consider upgrading to continue uploading files</p>
              </div>
            </div>
          )}
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Used</span>
              <span className="text-sm font-medium">{formatBytes(profile.storage_used)}</span>
            </div>
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all ${isNearLimit ? 'bg-yellow-500' : 'bg-primary'}`}
                style={{ width: `${Math.min(storagePercent, 100)}%` }}
              />
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-muted-foreground">Total: {formatBytes(profile.storage_limit)}</span>
              <span className="text-xs text-muted-foreground font-medium">{storagePercent}%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Upgrade Your Plan</CardTitle>
          <CardDescription>Get more storage and features</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/pricing">View Pricing Plans</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
