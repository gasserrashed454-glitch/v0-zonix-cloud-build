'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Server, Plus, Trash2, Play, Square, Copy, Check } from 'lucide-react'
import { toast } from 'sonner'

export default function NodeManagementPage() {
  const [nodes, setNodes] = useState<any[]>([])
  const [showAddNode, setShowAddNode] = useState(false)
  const [newNodeName, setNewNodeName] = useState('')
  const [newNodeUrl, setNewNodeUrl] = useState('')
  const [newNodeToken, setNewNodeToken] = useState('')
  const [consoleLogs, setConsoleLogs] = useState<string[]>([])
  const [selectedNode, setSelectedNode] = useState<any>(null)
  const [consoleInput, setConsoleInput] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleAddNode = () => {
    if (!newNodeName.trim() || !newNodeUrl.trim()) {
      toast.error('Name and URL are required')
      return
    }

    const newNode = {
      id: Date.now().toString(),
      name: newNodeName,
      url: newNodeUrl,
      token: newNodeToken || 'generated-' + Math.random().toString(36).substr(2, 9),
      status: 'offline',
      created: new Date().toISOString(),
      lastSeen: null,
    }

    setNodes([...nodes, newNode])
    toast.success('Node added')
    setNewNodeName('')
    setNewNodeUrl('')
    setNewNodeToken('')
    setShowAddNode(false)
  }

  const handleDeleteNode = (id: string) => {
    if (selectedNode?.id === id) setSelectedNode(null)
    setNodes(nodes.filter(n => n.id !== id))
    toast.success('Node removed')
  }

  const handleNodeStatus = (id: string, status: 'online' | 'offline') => {
    setNodes(nodes.map(n => 
      n.id === id ? { ...n, status, lastSeen: new Date().toISOString() } : n
    ))
    if (selectedNode?.id === id) {
      setSelectedNode({ ...selectedNode, status, lastSeen: new Date().toISOString() })
    }
  }

  const handleConsoleCommand = () => {
    if (!consoleInput.trim()) return

    const newLog = `$ ${consoleInput}`
    setConsoleLogs([...consoleLogs, newLog])

    // Simulate command execution
    setTimeout(() => {
      let output = ''
      if (consoleInput.includes('status')) {
        output = `Node ${selectedNode?.name} is ${selectedNode?.status}\nUptime: 23h 45m\nMemory: 2.4GB / 8GB\nCPU: 34%`
      } else if (consoleInput.includes('logs')) {
        output = `[INFO] Node started\n[INFO] Connected to database\n[INFO] Services initialized`
      } else if (consoleInput.includes('restart')) {
        output = 'Node restarting...'
        setTimeout(() => {
          handleNodeStatus(selectedNode.id, 'online')
          setConsoleLogs(prev => [...prev, 'Node successfully restarted'])
        }, 1000)
      } else if (consoleInput.includes('clear')) {
        setConsoleLogs([])
        return
      } else {
        output = `Command executed: ${consoleInput}`
      }

      if (output) {
        setConsoleLogs(prev => [...prev, output])
      }
    }, 300)

    setConsoleInput('')
  }

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    toast.success('Copied to clipboard')
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Server className="h-8 w-8" />
            Node Management
          </h1>
          <p className="text-muted-foreground">Manage and monitor Zonix Cloud nodes</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Nodes List */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Nodes ({nodes.length})</span>
                  <Button onClick={() => setShowAddNode(!showAddNode)} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Add Node Form */}
                {showAddNode && (
                  <div className="p-3 border rounded-lg space-y-2 bg-muted/50">
                    <Input
                      placeholder="Node name"
                      value={newNodeName}
                      onChange={(e) => setNewNodeName(e.target.value)}
                      className="h-8 text-sm"
                    />
                    <Input
                      placeholder="Node URL"
                      value={newNodeUrl}
                      onChange={(e) => setNewNodeUrl(e.target.value)}
                      className="h-8 text-sm"
                    />
                    <Input
                      placeholder="Token (optional)"
                      value={newNodeToken}
                      onChange={(e) => setNewNodeToken(e.target.value)}
                      className="h-8 text-sm"
                    />
                    <div className="flex gap-2">
                      <Button onClick={handleAddNode} size="sm" className="flex-1">Add</Button>
                      <Button variant="outline" size="sm" onClick={() => setShowAddNode(false)} className="flex-1">Cancel</Button>
                    </div>
                  </div>
                )}

                {/* Nodes List */}
                {nodes.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No nodes yet</p>
                ) : (
                  nodes.map(node => (
                    <div
                      key={node.id}
                      onClick={() => setSelectedNode(node)}
                      className={`p-3 border rounded-lg cursor-pointer transition ${
                        selectedNode?.id === node.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-sm truncate">{node.name}</p>
                        <Badge variant={node.status === 'online' ? 'default' : 'outline'} className="text-xs">
                          {node.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{node.url}</p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Node Details & Console */}
          <div className="lg:col-span-2 space-y-4">
            {selectedNode ? (
              <>
                {/* Node Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{selectedNode.name}</span>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant={selectedNode.status === 'online' ? 'outline' : 'default'}
                          onClick={() => handleNodeStatus(selectedNode.id, selectedNode.status === 'online' ? 'offline' : 'online')}
                          className="gap-1"
                        >
                          {selectedNode.status === 'online' ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                          {selectedNode.status === 'online' ? 'Stop' : 'Start'}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteNode(selectedNode.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">URL</p>
                        <div className="flex items-center gap-1 mt-1">
                          <code className="bg-muted px-2 py-1 rounded text-xs flex-1 truncate">{selectedNode.url}</code>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(selectedNode.url, 'url')}
                          >
                            {copiedId === 'url' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Token</p>
                        <div className="flex items-center gap-1 mt-1">
                          <code className="bg-muted px-2 py-1 rounded text-xs flex-1 truncate">{selectedNode.token}</code>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(selectedNode.token, 'token')}
                          >
                            {copiedId === 'token' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Created</p>
                        <p>{new Date(selectedNode.created).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Last Seen</p>
                        <p>{selectedNode.lastSeen ? new Date(selectedNode.lastSeen).toLocaleString() : 'Never'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Console */}
                <Card>
                  <CardHeader>
                    <CardTitle>Node Console</CardTitle>
                    <CardDescription>Execute commands on {selectedNode.name}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="bg-black text-green-400 rounded-lg p-4 font-mono text-sm h-64 overflow-y-auto space-y-1 border">
                      {consoleLogs.length === 0 ? (
                        <p className="text-muted-foreground">Welcome to Node Console</p>
                      ) : (
                        consoleLogs.map((log, i) => (
                          <p key={i} className={log.startsWith('$') ? 'text-blue-400' : ''}>{log}</p>
                        ))
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder='Try: "status", "logs", "restart", "clear"'
                        value={consoleInput}
                        onChange={(e) => setConsoleInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleConsoleCommand()}
                      />
                      <Button onClick={handleConsoleCommand}>Send</Button>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="h-full flex items-center justify-center">
                <CardContent>
                  <p className="text-muted-foreground text-center">Select a node to view details</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
