'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Ticket, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Search,
  Send,
  User
} from 'lucide-react'
import type { Ticket as TicketType, Profile } from '@/lib/types'

interface AdminTicketsContentProps {
  initialTickets: (TicketType & { profiles: { email: string; full_name: string | null } | null })[]
  staffMembers: Pick<Profile, 'id' | 'email' | 'full_name' | 'role'>[]
}

const statusColors = {
  open: 'bg-yellow-100 text-yellow-700',
  in_progress: 'bg-blue-100 text-blue-700',
  resolved: 'bg-green-100 text-green-700',
  closed: 'bg-gray-100 text-gray-700',
}

const priorityLabels = {
  1: 'Low',
  2: 'Medium',
  3: 'High',
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function AdminTicketsContent({ initialTickets, staffMembers }: AdminTicketsContentProps) {
  const [tickets, setTickets] = useState(initialTickets)
  const [selectedTicket, setSelectedTicket] = useState<typeof initialTickets[0] | null>(null)
  const [ticketDetailOpen, setTicketDetailOpen] = useState(false)
  const [messages, setMessages] = useState<Array<{id: string; message: string; sender_id: string; created_at: string; is_internal: boolean}>>([])
  const [newMessage, setNewMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.profiles?.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const openTickets = tickets.filter(t => t.status === 'open').length
  const inProgressTickets = tickets.filter(t => t.status === 'in_progress').length

  const handleViewTicket = async (ticket: typeof initialTickets[0]) => {
    setSelectedTicket(ticket)
    setTicketDetailOpen(true)
    
    try {
      const res = await fetch(`/api/tickets/${ticket.id}/messages`)
      if (res.ok) {
        const { messages } = await res.json()
        setMessages(messages)
      }
    } catch (error) {
      console.error('Fetch messages error:', error)
    }
  }

  const handleSendMessage = async (isInternal = false) => {
    if (!newMessage.trim() || !selectedTicket) return
    
    try {
      const res = await fetch(`/api/tickets/${selectedTicket.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: newMessage, isInternal }),
      })

      if (res.ok) {
        const { message } = await res.json()
        setMessages([...messages, message])
        setNewMessage('')
      }
    } catch (error) {
      console.error('Send message error:', error)
    }
  }

  const handleUpdateTicket = async (updates: Partial<TicketType>) => {
    if (!selectedTicket) return

    try {
      const res = await fetch(`/api/admin/tickets/${selectedTicket.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })

      if (res.ok) {
        setTickets(tickets.map(t => 
          t.id === selectedTicket.id ? { ...t, ...updates } : t
        ))
        setSelectedTicket({ ...selectedTicket, ...updates })
      }
    } catch (error) {
      console.error('Update ticket error:', error)
    }
  }

  return (
    <>
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{openTickets}</p>
                <p className="text-sm text-muted-foreground">Open Tickets</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{inProgressTickets}</p>
                <p className="text-sm text-muted-foreground">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{tickets.length}</p>
                <p className="text-sm text-muted-foreground">Total Tickets</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tickets List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Ticket className="h-5 w-5" />
              All Tickets
            </CardTitle>
            <div className="flex items-center gap-2">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tickets..."
                  className="pl-9 w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All ({tickets.length})</TabsTrigger>
              <TabsTrigger value="open">Open ({openTickets})</TabsTrigger>
              <TabsTrigger value="in_progress">In Progress ({inProgressTickets})</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="mt-4">
              <div className="space-y-3">
                {filteredTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => handleViewTicket(ticket)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{ticket.subject}</p>
                        <p className="text-sm text-muted-foreground">
                          {ticket.profiles?.email || 'Unknown'} &bull; {formatDate(ticket.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {priorityLabels[ticket.priority as keyof typeof priorityLabels]}
                      </Badge>
                      <Badge className={statusColors[ticket.status as keyof typeof statusColors]}>
                        {ticket.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="open" className="mt-4">
              <div className="space-y-3">
                {filteredTickets.filter(t => t.status === 'open').map((ticket) => (
                  <div
                    key={ticket.id}
                    className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 cursor-pointer"
                    onClick={() => handleViewTicket(ticket)}
                  >
                    <div>
                      <p className="font-medium">{ticket.subject}</p>
                      <p className="text-sm text-muted-foreground">
                        {ticket.profiles?.email} &bull; {formatDate(ticket.created_at)}
                      </p>
                    </div>
                    <Badge className={statusColors.open}>open</Badge>
                  </div>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="in_progress" className="mt-4">
              <div className="space-y-3">
                {filteredTickets.filter(t => t.status === 'in_progress').map((ticket) => (
                  <div
                    key={ticket.id}
                    className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 cursor-pointer"
                    onClick={() => handleViewTicket(ticket)}
                  >
                    <div>
                      <p className="font-medium">{ticket.subject}</p>
                      <p className="text-sm text-muted-foreground">
                        {ticket.profiles?.email} &bull; {formatDate(ticket.created_at)}
                      </p>
                    </div>
                    <Badge className={statusColors.in_progress}>in progress</Badge>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Ticket Detail Dialog */}
      <Dialog open={ticketDetailOpen} onOpenChange={setTicketDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{selectedTicket?.subject}</DialogTitle>
            <DialogDescription>
              From: {selectedTicket?.profiles?.email} &bull; #{selectedTicket?.id.slice(0, 8)}
            </DialogDescription>
          </DialogHeader>
          
          {/* Ticket Controls */}
          <div className="flex items-center gap-4 py-2 border-b">
            <Select
              value={selectedTicket?.status}
              onValueChange={(value) => handleUpdateTicket({ status: value as TicketType['status'] })}
            >
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={selectedTicket?.assigned_to || 'unassigned'}
              onValueChange={(value) => handleUpdateTicket({ assigned_to: value === 'unassigned' ? null : value })}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Assign to..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {staffMembers.map((staff) => (
                  <SelectItem key={staff.id} value={staff.id}>
                    {staff.full_name || staff.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-4 py-4">
            {/* Original description */}
            <div className="p-4 bg-muted/30 rounded-lg">
              <p className="text-sm font-medium mb-1">Original Request</p>
              <p className="text-sm">{selectedTicket?.description}</p>
            </div>

            {/* Messages */}
            <div className="space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-3 rounded-lg ${
                    msg.is_internal
                      ? 'bg-orange-50 border border-orange-200'
                      : msg.sender_id === selectedTicket?.user_id
                      ? 'bg-muted/50 mr-8'
                      : 'bg-primary/10 ml-8'
                  }`}
                >
                  {msg.is_internal && (
                    <Badge variant="outline" className="mb-2 text-xs">Internal Note</Badge>
                  )}
                  <p className="text-sm">{msg.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDate(msg.created_at)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Message Input */}
          {selectedTicket?.status !== 'closed' && (
            <div className="space-y-2 pt-4 border-t">
              <Input
                placeholder="Type your response..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => handleSendMessage(true)}>
                  Add Internal Note
                </Button>
                <Button onClick={() => handleSendMessage(false)}>
                  <Send className="h-4 w-4 mr-2" />
                  Send Reply
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
