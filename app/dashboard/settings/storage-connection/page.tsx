'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, Lock, Server, Shield, Check } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

interface StorageConnection {
  id: string
  name: string
  type: 'vps' | 'nas' | 'dedicated'
  hostname: string
  status: 'active' | 'inactive' | 'error'
  connected_at: string
}

export default function StorageConnectionPage() {
  const supabase = createClient()
  const [connections, setConnections] = useState<StorageConnection[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [testingConnection, setTestingConnection] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    type: 'vps' as 'vps' | 'nas' | 'dedicated',
    hostname: '',
    port: '22',
    username: '',
    password: '',
    confirmPassword: '',
    protocol: 'ssh' as 'ssh' | 'smb' | 'nfs',
  })

  const handleAddConnection = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }

    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Not authenticated')
        return
      }

      // Create encrypted connection record
      const response = await fetch('/api/storage/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          user_id: user.id,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create connection')
      }

      const newConnection = await response.json()
      setConnections([...connections, newConnection])
      setFormData({
        name: '',
        type: 'vps',
        hostname: '',
        port: '22',
        username: '',
        password: '',
        confirmPassword: '',
        protocol: 'ssh',
      })
      setShowAddForm(false)
      toast.success('Storage connection created successfully')
    } catch (error) {
      console.error('[LOG] Storage connection error:', error)
      toast.error('Failed to create storage connection')
    } finally {
      setIsLoading(false)
    }
  }

  const handleTestConnection = async (connectionId: string) => {
    setTestingConnection(connectionId)
    try {
      const response = await fetch('/api/storage/connections/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectionId }),
      })

      if (response.ok) {
        toast.success('Connection test successful')
        // Update status
        setConnections(
          connections.map(c => 
            c.id === connectionId ? { ...c, status: 'active' } : c
          )
        )
      } else {
        toast.error('Connection test failed')
      }
    } catch (error) {
      console.error('[LOG] Test error:', error)
      toast.error('Failed to test connection')
    } finally {
      setTestingConnection(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Storage Connections</h1>
        <p className="text-muted-foreground">Connect VPS, NAS, or dedicated servers for extended storage</p>
      </div>

      <Alert>
        <Lock className="h-4 w-4" />
        <AlertTitle>Password-Protected Connections</AlertTitle>
        <AlertDescription>
          All storage connections require a secure password. Passwords are encrypted and never displayed after creation.
          Use strong passwords with at least 8 characters.
        </AlertDescription>
      </Alert>

      {/* Add Connection Form */}
      {showAddForm ? (
        <Card>
          <CardHeader>
            <CardTitle>Add Storage Connection</CardTitle>
            <CardDescription>Connect a new VPS, NAS, or dedicated server</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddConnection} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Connection Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., US-East-1"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Storage Type</Label>
                  <select
                    id="type"
                    className="w-full border rounded px-3 py-2 bg-background"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  >
                    <option value="vps">VPS</option>
                    <option value="nas">NAS</option>
                    <option value="dedicated">Dedicated Server</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hostname">Hostname/IP Address</Label>
                  <Input
                    id="hostname"
                    placeholder="192.168.1.100 or storage.example.com"
                    value={formData.hostname}
                    onChange={(e) => setFormData({ ...formData, hostname: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="port">Port</Label>
                  <Input
                    id="port"
                    type="number"
                    placeholder="22"
                    value={formData.port}
                    onChange={(e) => setFormData({ ...formData, port: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    placeholder="Storage account username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="protocol">Protocol</Label>
                  <select
                    id="protocol"
                    className="w-full border rounded px-3 py-2 bg-background"
                    value={formData.protocol}
                    onChange={(e) => setFormData({ ...formData, protocol: e.target.value as any })}
                  >
                    <option value="ssh">SSH</option>
                    <option value="smb">SMB/CIFS</option>
                    <option value="nfs">NFS</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter secure password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Confirm password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Creating...' : 'Create Connection'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Button onClick={() => setShowAddForm(true)}>
          <Server className="mr-2 h-4 w-4" />
          Add Storage Connection
        </Button>
      )}

      {/* Connected Storage */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Connected Storage ({connections.length})
          </CardTitle>
          <CardDescription>Your external storage connections</CardDescription>
        </CardHeader>
        <CardContent>
          {connections.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              No storage connections yet. Add one to expand your storage capacity.
            </p>
          ) : (
            <div className="space-y-4">
              {connections.map((conn) => (
                <div key={conn.id} className="border rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{conn.name}</h3>
                    <p className="text-sm text-muted-foreground">{conn.hostname}:{conn.protocol}</p>
                    <p className="text-xs text-muted-foreground mt-1">Connected {new Date(conn.connected_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={conn.status === 'active' ? 'default' : 'secondary'}>
                      {conn.status === 'active' && <Check className="h-3 w-3 mr-1" />}
                      {conn.status}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleTestConnection(conn.id)}
                      disabled={testingConnection === conn.id}
                    >
                      {testingConnection === conn.id ? 'Testing...' : 'Test'}
                    </Button>
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
