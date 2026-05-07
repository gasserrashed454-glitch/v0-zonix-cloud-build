'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'
import { Trash2, Plus, Network, AlertCircle, CheckCircle } from 'lucide-react'

interface StorageConnection {
  id: string
  connection_name: string
  protocol: 'ssh' | 'smb' | 'nfs'
  host: string
  port: number
  username: string
  storage_path?: string
  export_path?: string
  is_active: boolean
  created_at: string
}

export function StorageConnectionManager() {
  const [isLoading, setIsLoading] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [connections, setConnections] = useState<StorageConnection[]>([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    connectionName: '',
    protocol: 'ssh' as 'ssh' | 'smb' | 'nfs',
    host: '',
    port: '22',
    username: '',
    password: '',
    storagePath: '',
    exportPath: '',
  })

  useEffect(() => {
    fetchConnections()
  }, [])

  const fetchConnections = async () => {
    try {
      const response = await fetch('/api/storage/connect')
      const data = await response.json()
      if (response.ok) {
        setConnections(data.connections || [])
      }
    } catch (error) {
      console.error('[v0] Fetch connections error:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsConnecting(true)

    try {
      const payload: any = {
        action: 'connect',
        connectionName: formData.connectionName,
        protocol: formData.protocol,
        host: formData.host,
        port: parseInt(formData.port),
        username: formData.username,
        password: formData.password,
      }

      if (formData.protocol === 'ssh') {
        payload.storagePath = formData.storagePath
      } else if (formData.protocol === 'nfs') {
        payload.exportPath = formData.exportPath
      }

      const response = await fetch('/api/storage/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error)
      }

      toast.success('Storage connection created successfully')
      setFormData({
        connectionName: '',
        protocol: 'ssh',
        host: '',
        port: '22',
        username: '',
        password: '',
        storagePath: '',
        exportPath: '',
      })
      setShowForm(false)
      await fetchConnections()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create connection')
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDelete = async (connectionId: string) => {
    if (!confirm('Delete this storage connection?')) return

    try {
      const response = await fetch('/api/storage/connect', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectionId }),
      })

      if (!response.ok) {
        throw new Error('Failed to delete connection')
      }

      toast.success('Connection deleted')
      await fetchConnections()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete connection')
    }
  }

  const getPortForProtocol = () => {
    const ports = { ssh: '22', smb: '445', nfs: '2049' }
    return ports[formData.protocol]
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Network className="h-5 w-5" />
          Storage Connections
        </CardTitle>
        <CardDescription>Connect to VPS/NAS storage with SSH, SMB, or NFS</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add Connection Form */}
        {!showForm ? (
          <Button onClick={() => setShowForm(true)} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Storage Connection
          </Button>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="connection-name">Connection Name</Label>
                <Input
                  id="connection-name"
                  placeholder="My NAS"
                  value={formData.connectionName}
                  onChange={(e) => setFormData({ ...formData, connectionName: e.target.value })}
                  required
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="protocol">Protocol</Label>
                <Select value={formData.protocol} onValueChange={(value: any) => {
                  setFormData({ ...formData, protocol: value, port: getPortForProtocol() })
                }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ssh">SSH (Secure Shell)</SelectItem>
                    <SelectItem value="smb">SMB (Windows/Samba)</SelectItem>
                    <SelectItem value="nfs">NFS (Network File System)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="host">Host/IP Address</Label>
                <Input
                  id="host"
                  placeholder="192.168.1.100"
                  value={formData.host}
                  onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="port">Port</Label>
                <Input
                  id="port"
                  type="number"
                  value={formData.port}
                  onChange={(e) => setFormData({ ...formData, port: e.target.value })}
                  required
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="storage_user"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Strong password (min 8 chars)"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>

              {formData.protocol === 'ssh' && (
                <div className="col-span-2">
                  <Label htmlFor="storage-path">Storage Path</Label>
                  <Input
                    id="storage-path"
                    placeholder="/mnt/storage"
                    value={formData.storagePath}
                    onChange={(e) => setFormData({ ...formData, storagePath: e.target.value })}
                    required
                  />
                </div>
              )}

              {formData.protocol === 'nfs' && (
                <div className="col-span-2">
                  <Label htmlFor="export-path">Export Path</Label>
                  <Input
                    id="export-path"
                    placeholder="/export/storage"
                    value={formData.exportPath}
                    onChange={(e) => setFormData({ ...formData, exportPath: e.target.value })}
                    required
                  />
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={isConnecting} className="flex-1">
                {isConnecting ? <Spinner className="mr-2" /> : null}
                Create Connection
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
                disabled={isConnecting}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}

        {/* Connections List */}
        {connections.length > 0 ? (
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Active Connections</h3>
            {connections.map((conn) => (
              <div key={conn.id} className="p-4 border rounded-lg space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium flex items-center gap-2">
                      {conn.is_active ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                      )}
                      {conn.connection_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {conn.protocol.toUpperCase()} • {conn.username}@{conn.host}:{conn.port}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(conn.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            No storage connections yet
          </p>
        )}
      </CardContent>
    </Card>
  )
}
