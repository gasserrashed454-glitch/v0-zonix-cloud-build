'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Database, Cloud, Server, Check, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export default function AdminStoragePage() {
  const [useAzure, setUseAzure] = useState(false)
  const [azureConnectionString, setAzureConnectionString] = useState('')
  const [azureContainerName, setAzureContainerName] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle')

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const res = await fetch('/api/admin/storage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          use_azure: useAzure,
          azure_connection_string: azureConnectionString,
          azure_container_name: azureContainerName,
        }),
      })

      if (res.ok) {
        alert('Storage settings saved successfully!')
      } else {
        alert('Failed to save settings')
      }
    } catch (error) {
      console.error('Save error:', error)
      alert('Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  const handleTestConnection = async () => {
    setTestStatus('testing')
    try {
      const res = await fetch('/api/admin/storage/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          azure_connection_string: azureConnectionString,
          azure_container_name: azureContainerName,
        }),
      })

      if (res.ok) {
        setTestStatus('success')
      } else {
        setTestStatus('error')
      }
    } catch {
      setTestStatus('error')
    }
  }

  return (
    <div className="flex-1 p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Storage Configuration</h1>
        <p className="text-muted-foreground">Configure your storage backend</p>
      </div>

      {/* Current Storage Provider */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className={!useAzure ? 'ring-2 ring-primary' : ''}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Cloud className="h-5 w-5" />
                Vercel Blob
              </CardTitle>
              {!useAzure && <Badge>Active</Badge>}
            </div>
            <CardDescription>Default storage provider</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                Serverless & auto-scaling
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                Global CDN included
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                No configuration needed
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className={useAzure ? 'ring-2 ring-primary' : ''}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                Azure Blob Storage
              </CardTitle>
              {useAzure && <Badge>Active</Badge>}
            </div>
            <CardDescription>Enterprise storage option</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                Your own Azure account
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                Full data sovereignty
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                Custom retention policies
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Azure Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Azure Blob Storage Configuration
          </CardTitle>
          <CardDescription>
            Link your own Azure Storage account for enterprise storage
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Azure Storage</Label>
              <p className="text-sm text-muted-foreground">
                Switch from Vercel Blob to Azure Blob Storage
              </p>
            </div>
            <Switch
              checked={useAzure}
              onCheckedChange={setUseAzure}
            />
          </div>

          {useAzure && (
            <>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Important</AlertTitle>
                <AlertDescription>
                  Enabling Azure Storage will redirect all new file uploads to your Azure account. 
                  Existing files will remain in Vercel Blob.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="connectionString">Connection String</Label>
                  <Input
                    id="connectionString"
                    type="password"
                    placeholder="DefaultEndpointsProtocol=https;AccountName=..."
                    value={azureConnectionString}
                    onChange={(e) => setAzureConnectionString(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Find this in your Azure Portal under Storage Account &gt; Access Keys
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="containerName">Container Name</Label>
                  <Input
                    id="containerName"
                    placeholder="zonix-files"
                    value={azureContainerName}
                    onChange={(e) => setAzureContainerName(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    The container must already exist in your storage account
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleTestConnection}
                    disabled={testStatus === 'testing' || !azureConnectionString || !azureContainerName}
                  >
                    {testStatus === 'testing' ? 'Testing...' : 'Test Connection'}
                  </Button>
                  {testStatus === 'success' && (
                    <Badge className="bg-green-100 text-green-700">
                      <Check className="h-3 w-3 mr-1" />
                      Connected
                    </Badge>
                  )}
                  {testStatus === 'error' && (
                    <Badge className="bg-red-100 text-red-700">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Failed
                    </Badge>
                  )}
                </div>
              </div>
            </>
          )}

          <div className="pt-4 border-t flex justify-end">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
