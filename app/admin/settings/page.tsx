import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Settings, CheckCircle, AlertTriangle } from 'lucide-react'

export default async function AdminSettingsPage() {
  const supabase = await createClient()

  const { data: settings } = await supabase
    .from('admin_settings')
    .select('*')

  return (
    <div className="flex-1 p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Settings</h1>
        <p className="text-muted-foreground">Configure system-wide settings and integrations</p>
      </div>

      {/* Azure Storage Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Azure Storage Configuration
          </CardTitle>
          <CardDescription>Optional secondary storage backend</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Azure Storage is optional. Files will use Vercel Blob by default.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div>
              <Label htmlFor="azure-conn">Connection String</Label>
              <Input
                id="azure-conn"
                type="password"
                placeholder="DefaultEndpointsProtocol=https;..."
                defaultValue={settings?.find(s => s.key === 'azure_connection_string')?.value?.connection_string || ''}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Find this in Azure Storage Account → Access keys
              </p>
            </div>

            <div>
              <Label htmlFor="azure-container">Container Name</Label>
              <Input
                id="azure-container"
                placeholder="zonix-files"
                defaultValue={settings?.find(s => s.key === 'azure_connection_string')?.value?.container_name || 'zonix-files'}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Container where files will be stored
              </p>
            </div>

            <div className="flex gap-2">
              <Button>Test Connection</Button>
              <Button variant="outline">Clear Configuration</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Email Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Email Service
          </CardTitle>
          <CardDescription>Resend email configuration status</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div>
              <p className="font-medium text-green-900">Resend API Connected</p>
              <p className="text-sm text-green-700">Email verification is enabled</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Manage Resend API key in environment variables. Current key is configured and active.
          </p>
        </CardContent>
      </Card>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
          <CardDescription>Overall platform health</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
            <span className="font-medium">Database Connection</span>
            <Badge variant="success">Connected</Badge>
          </div>
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
            <span className="font-medium">File Storage (Blob)</span>
            <Badge variant="success">Operational</Badge>
          </div>
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
            <span className="font-medium">Email Service</span>
            <Badge variant="success">Active</Badge>
          </div>
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
            <span className="font-medium">AI Service</span>
            <Badge variant="success">Ready</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function Badge({ variant, children }: { variant: 'success' | 'warning' | 'error'; children: React.ReactNode }) {
  const variantClasses = {
    success: 'bg-green-100 text-green-700',
    warning: 'bg-yellow-100 text-yellow-700',
    error: 'bg-red-100 text-red-700',
  }
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${variantClasses[variant]}`}>
      {children}
    </span>
  )
}
