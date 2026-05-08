'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { ZonixLogo } from '@/components/zonix-logo'
import type { Profile } from '@/lib/types'
import {
  ArrowLeft,
  Send,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
} from 'lucide-react'

interface TicketMessage {
  id: string
  ticket_id: string
  sender_id: string
  message: string
  is_internal: boolean
  created_at: string
  profiles: {
    full_name: string | null
    email: string
    avatar_url: string | null
    role: string
  } | null
}

interface Ticket {
  id: string
  user_id: string
  subject: string
  description: string
  status: string
  priority: number
  created_at: string
  profiles: {
    id: string
    full_name: string | null
    email: string
    avatar_url: string | null
    tier: string
  } | null
}

interface TicketDetailContentProps {
  profile: Profile
  ticket: Ticket
  initialMessages: TicketMessage[]
}

const statusColors: Record<string, string> = {
  open: 'bg-amber-100 text-amber-700',
  in_progress: 'bg-blue-100 text-blue-700',
  resolved: 'bg-green-100 text-green-700',
  closed: 'bg-muted text-muted-foreground',
}

const priorityLabels: Record<number, string> = {
  1: 'Low',
  2: 'Medium',
  3: 'High',
}

function formatDate(date: string): string {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getInitials(name: string | null, email: string): string {
  if (name) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }
  return email.slice(0, 2).toUpperCase()
}

export function TicketDetailContent({ profile, ticket, initialMessages }: TicketDetailContentProps) {
  const [messages, setMessages] = useState<TicketMessage[]>(initialMessages)
  const [newMessage, setNewMessage] = useState('')
  const [isInternal, setIsInternal] = useState(false)
  const [status, setStatus] = useState(ticket.status)
  const [isSending, setIsSending] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Real-time subscription for new messages
  useEffect(() => {
    const channel = supabase
      .channel(`ticket-${ticket.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ticket_messages',
          filter: `ticket_id=eq.${ticket.id}`,
        },
        async (payload) => {
          // Fetch the full message with profile
          const { data } = await supabase
            .from('ticket_messages')
            .select('*, profiles(full_name, email, avatar_url, role)')
            .eq('id', payload.new.id)
            .single()
          
          if (data && !messages.find(m => m.id === data.id)) {
            setMessages(prev => [...prev, data])
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [ticket.id, supabase, messages])

  async function handleSendMessage() {
    if (!newMessage.trim()) return
    
    setIsSending(true)
    try {
      const res = await fetch(`/api/tickets/${ticket.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: newMessage, isInternal }),
      })

      if (res.ok) {
        setNewMessage('')
        setIsInternal(false)
        toast.success('Message sent')
      } else {
        const error = await res.json()
        toast.error(error.error || 'Failed to send message')
      }
    } catch (error) {
      console.error('Send message error:', error)
      toast.error('Failed to send message')
    } finally {
      setIsSending(false)
    }
  }

  async function handleStatusChange(newStatus: string) {
    setIsUpdating(true)
    try {
      const { error } = await supabase
        .from('tickets')
        .update({ status: newStatus })
        .eq('id', ticket.id)

      if (error) throw error

      setStatus(newStatus)
      toast.success(`Ticket status updated to ${newStatus.replace('_', ' ')}`)

      // Send notification to user
      await supabase.from('notifications').insert({
        user_id: ticket.user_id,
        type: 'ticket_update',
        title: 'Ticket Status Updated',
        message: `Your ticket "${ticket.subject}" has been marked as ${newStatus.replace('_', ' ')}.`,
      })
    } catch (error) {
      console.error('Update status error:', error)
      toast.error('Failed to update status')
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-40">
        <div className="container mx-auto flex h-14 items-center gap-4 px-4">
          <Link href="/support-panel" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <ZonixLogo size="sm" />
          <span className="font-semibold">Ticket #{ticket.id.slice(0, 8)}</span>
          <Badge className={statusColors[status]}>{status.replace('_', ' ')}</Badge>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 container mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Messages Section */}
        <div className="lg:col-span-2 flex flex-col">
          <Card className="flex-1 flex flex-col">
            <CardHeader className="border-b">
              <CardTitle className="text-lg">{ticket.subject}</CardTitle>
              <p className="text-sm text-muted-foreground">{ticket.description}</p>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-0">
              {/* Messages List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[50vh]">
                {messages.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isStaff = msg.profiles?.role && ['admin', 'mod', 'support'].includes(msg.profiles.role)
                    const isOwn = msg.sender_id === profile.id
                    
                    return (
                      <div
                        key={msg.id}
                        className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}
                      >
                        <Avatar className="h-8 w-8 shrink-0">
                          <AvatarImage src={msg.profiles?.avatar_url || undefined} />
                          <AvatarFallback className={isStaff ? 'bg-primary text-primary-foreground' : ''}>
                            {getInitials(msg.profiles?.full_name || null, msg.profiles?.email || 'U')}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`max-w-[70%] ${isOwn ? 'text-right' : ''}`}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium">
                              {msg.profiles?.full_name || msg.profiles?.email}
                            </span>
                            {isStaff && (
                              <Badge variant="secondary" className="text-xs">Staff</Badge>
                            )}
                            {msg.is_internal && (
                              <Badge variant="outline" className="text-xs text-amber-600">Internal</Badge>
                            )}
                          </div>
                          <div
                            className={`rounded-lg px-4 py-2 ${
                              isOwn
                                ? 'bg-primary text-primary-foreground'
                                : msg.is_internal
                                ? 'bg-amber-50 border border-amber-200'
                                : 'bg-muted'
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDate(msg.created_at)}
                          </p>
                        </div>
                      </div>
                    )
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              {status !== 'closed' && (
                <div className="border-t p-4 space-y-3">
                  <Textarea
                    placeholder="Type your response..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="min-h-20 resize-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                        handleSendMessage()
                      }
                    }}
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="internal"
                        checked={isInternal}
                        onCheckedChange={(checked) => setIsInternal(checked === true)}
                      />
                      <Label htmlFor="internal" className="text-sm text-muted-foreground">
                        Internal note (not visible to user)
                      </Label>
                    </div>
                    <Button onClick={handleSendMessage} disabled={isSending || !newMessage.trim()}>
                      {isSending ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4 mr-2" />
                      )}
                      Send
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* User Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Submitted By</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={ticket.profiles?.avatar_url || undefined} />
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{ticket.profiles?.full_name || 'Unknown'}</p>
                  <p className="text-sm text-muted-foreground">{ticket.profiles?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="capitalize">{ticket.profiles?.tier}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Ticket Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Ticket Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground">Status</Label>
                <Select value={status} onValueChange={handleStatusChange} disabled={isUpdating}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Priority</Label>
                <p className="mt-1">{priorityLabels[ticket.priority] || 'Unknown'}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Created</Label>
                <p className="mt-1 text-sm">{formatDate(ticket.created_at)}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Ticket ID</Label>
                <p className="mt-1 text-sm font-mono">{ticket.id}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
