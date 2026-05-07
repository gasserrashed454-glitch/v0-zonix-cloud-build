'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Server, Check, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export default function AdminStoragePage() {
  const [nodes, setNodes] = useState<Array<{
    id: string
    name: string
    type: 'vps' | 'dedicated'
    hostname: string
    protocol: 'ssh' | 'api'
    port: number
    username: string
    status: 'active' | 'inactive' | 'testing'
    allocated_ram: number
    allocated_storage: number
  }>>([])
  
  const [newNode, setNewNode] = useState({
    name: '',
    hostname: '',
    username: '',
    protocol: 'ssh' as 'ssh' | 'api',
    port: 22,
  })
  
  const [isSaving, setIsSaving] = useState(false)

  const handleAddNode = async () => {
    setIsSaving(true)
    try {
      const res = await fetch('/api/admin/nodes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newNode),
      })

      if (res.ok) {
        const data = await res.json()
        setNodes([...nodes, data.node])
        setNewNode({ name: '', hostname: '', username: '', protocol: 'ssh', port: 22 })
        alert('Node added successfully!')
      } else {
        alert('Failed to add node')
      }
    } catch (error) {
      console.error('Error adding node:', error)
      alert('Failed to add node')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Storage Nodes</h1>
        <p className="text-muted-foreground mt-2">
          Manage your VPS and dedicated server nodes to expand Zonix storage capacity.
        </p>
      </div>

      {/* Add New Node */}
      <Card>
        <CardHeader>
          <CardTitle>Add Storage Node</CardTitle>
          <CardDescription>
            Connect a VPS or dedicated server to expand storage capacity
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Node Name</Label>
              <Input
                id="name"
                placeholder="e.g., US-East-1"
                value={newNode.name}
                onChange={(e) => setNewNode({ ...newNode, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hostname">Hostname/IP</Label>
              <Input
                id="hostname"
                placeholder="e.g., storage-node-1.example.com"
                value={newNode.hostname}
                onChange={(e) => setNewNode({ ...newNode, hostname: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="SSH username"
                value={newNode.username}
                onChange={(e) => setNewNode({ ...newNode, username: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="protocol">Protocol</Label>
              <select
                id="protocol"
                className="w-full border rounded-md px-3 py-2 bg-background"
                value={newNode.protocol}
                onChange={(e) => setNewNode({ ...newNode, protocol: e.target.value as 'ssh' | 'api' })}
              >
                <option value="ssh">SSH</option>
                <option value="api">API Key</option>
              </select>
            </div>
          </div>

          <Alert>
            <Server className="h-4 w-4" />
            <AlertTitle>Security Notice</AlertTitle>
            <AlertDescription>
              Credentials are encrypted and stored securely. SSH keys should be dedicated to Zonix storage operations.
            </AlertDescription>
          </Alert>

          <Button onClick={handleAddNode} disabled={isSaving}>
            {isSaving ? 'Adding...' : 'Add Node'}
          </Button>
        </CardContent>
      </Card>

      {/* Connected Nodes */}
      <Card>
        <CardHeader>
          <CardTitle>Connected Nodes ({nodes.length})</CardTitle>
          <CardDescription>
            Manage your storage nodes and allocate resources to Zonix
          </CardDescription>
        </CardHeader>
        <CardContent>
          {nodes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No storage nodes connected yet. Add one above to get started.
            </div>
          ) : (
            <div className="space-y-4">
              {nodes.map((node) => (
                <div key={node.id} className="border rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Server className="h-5 w-5 text-primary" />
                    <div>
                      <h3 className="font-medium">{node.name}</h3>
                      <p className="text-sm text-muted-foreground">{node.hostname}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={node.status === 'active' ? 'default' : 'secondary'}>
                      {node.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
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
