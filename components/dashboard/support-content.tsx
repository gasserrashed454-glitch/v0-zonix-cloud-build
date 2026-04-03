'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  Plus, 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Send,
  Mail
} from 'lucide-react'
import type { Ticket as TicketType } from '@/lib/types'

interface SupportContentProps {
  userId: string
  initialTickets: TicketType[]
}

const statusColors = {
  open: 'bg-yellow-100 text-yellow-700',
  in_progress: 'bg-blue-100 text-blue-700',
  resolved: 'bg-green-100 text-green-700',
  closed: 'bg-gray-100 text-gray-700',
}

const statusIcons = {
  open: AlertCircle,
  in_progress: Clock,
  resolved: CheckCircle2,
  closed: CheckCircle2,
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function SupportContent({ userId, initialTickets }: SupportContentProps) {
  const [tickets, setTickets] = useState(initialTickets)
  const [newTicketOpen, setNewTicketOpen] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null)
  const [ticketDetailOpen, setTicketDetailOpen] = useState(false)
  const [messages, setMessages] = useState<Array<{id: string; message: string; sender_id: string; created_at: string}>>([])
  const [newMessage, setNewMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const supabase = createClient()

  // New ticket form state
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('1')

  // Real-time subscription for tickets and messages
  useEffect(() => {
    const ticketsChannel = supabase
      .channel('user-tickets')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tickets', filter: `user_id=eq.${userId}` },
        async () => {
          const { data } = await supabase
            .from('tickets')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
          
          if (data) {
            setTickets(data)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(ticketsChannel)
    }
  }, [userId, supabase])

  // Real-time subscription for messages when a ticket is selected
  useEffect(() => {
    if (!selectedTicket) return

    const messagesChannel = supabase
      .channel(`ticket-messages-${selectedTicket.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'ticket_messages', filter: `ticket_id=eq.${selectedTicket.id}` },
        async () => {
          const { data } = await supabase
            .from('ticket_messages')
            .select('*')
            .eq('ticket_id', selectedTicket.id)
            .eq('is_internal', false)
            .order('created_at', { ascending: true })
          
          if (data) {
            setMessages(data)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(messagesChannel)
    }
  }, [selectedTicket, supabase])

  const handleCreateTicket = async () => {
    if (!subject.trim() || !description.trim()) return
    
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, description, priority: parseInt(priority) }),
      })

      if (res.ok) {
        const { ticket } = await res.json()
        setTickets([ticket, ...tickets])
        setNewTicketOpen(false)
        setSubject('')
        setDescription('')
        setPriority('1')
      }
    } catch (error) {
      console.error('Create ticket error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleViewTicket = async (ticket: TicketType) => {
    setSelectedTicket(ticket)
    setTicketDetailOpen(true)
    
    // Fetch messages
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

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedTicket) return
    
    try {
      const res = await fetch(`/api/tickets/${selectedTicket.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: newMessage }),
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

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Support</h1>
          <p className="text-muted-foreground">Get help with your Zonix Cloud account</p>
        </div>
        <Dialog open={newTicketOpen} onOpenChange={setNewTicketOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Ticket
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Support Ticket</DialogTitle>
              <DialogDescription>
                Describe your issue and our team will help you
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  placeholder="Brief description of your issue"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Low</SelectItem>
                    <SelectItem value="2">Medium</SelectItem>
                    <SelectItem value="3">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Please provide details about your issue..."
                  className="min-h-32"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setNewTicketOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateTicket} disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Ticket'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Quick Contact */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium">Need immediate help?</p>
              <p className="text-sm text-muted-foreground">
                Contact us directly at gassetrashed454@gmail.com
              </p>
            </div>
          </div>
          <Button variant="outline" asChild>
            <a href="mailto:gassetrashed454@gmail.com">Send Email</a>
          </Button>
        </CardContent>
      </Card>

      {/* Tickets List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5" />
            Your Tickets
          </CardTitle>
          <CardDescription>
            View and manage your support requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          {tickets.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No support tickets yet</p>
              <p className="text-sm text-muted-foreground">
                Create a ticket if you need help
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {tickets.map((ticket) => {
                const StatusIcon = statusIcons[ticket.status as keyof typeof statusIcons]
                return (
                  <div
                    key={ticket.id}
                    className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => handleViewTicket(ticket)}
                  >
                    <div className="flex items-center gap-4">
                      <StatusIcon className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{ticket.subject}</p>
                        <p className="text-sm text-muted-foreground">
                          #{ticket.id.slice(0, 8)} &bull; {formatDate(ticket.created_at)}
                        </p>
                      </div>
                    </div>
                    <Badge className={statusColors[ticket.status as keyof typeof statusColors]}>
                      {ticket.status.replace('_', ' ')}
                    </Badge>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ticket Detail Dialog */}
      <Dialog open={ticketDetailOpen} onOpenChange={setTicketDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedTicket?.subject}
              {selectedTicket && (
                <Badge className={statusColors[selectedTicket.status as keyof typeof statusColors]}>
                  {selectedTicket.status.replace('_', ' ')}
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription>
              Ticket #{selectedTicket?.id.slice(0, 8)} &bull; Created {selectedTicket && formatDate(selectedTicket.created_at)}
            </DialogDescription>
          </DialogHeader>
          
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
                    msg.sender_id === userId
                      ? 'bg-primary/10 ml-8'
                      : 'bg-muted/50 mr-8'
                  }`}
                >
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
            <div className="flex gap-2 pt-4 border-t">
              <Input
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <Button onClick={handleSendMessage}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
