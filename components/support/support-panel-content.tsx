'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { ZonixLogo } from '@/components/zonix-logo'
import type { Profile } from '@/lib/types'
import {
  ArrowLeft,
  GraduationCap,
  MessageSquare,
  CheckCircle,
  XCircle,
  Search,
  Clock,
  AlertCircle,
  User,
} from 'lucide-react'

interface SupportPanelContentProps {
  profile: Profile
  pendingVerifications: Profile[]
  tickets: Array<{
    id: string
    subject: string
    status: string
    priority: string
    created_at: string
    profiles: {
      full_name: string | null
      email: string
    } | null
  }>
}

export function SupportPanelContent({ profile, pendingVerifications, tickets: initialTickets }: SupportPanelContentProps) {
  const [verifications, setVerifications] = useState(pendingVerifications)
  const [tickets, setTickets] = useState(initialTickets)
  const [searchQuery, setSearchQuery] = useState('')
  const supabase = createClient()

  // Real-time subscription for tickets
  useEffect(() => {
    const ticketsChannel = supabase
      .channel('tickets-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tickets' },
        async () => {
          // Refetch all tickets on any change
          const { data } = await supabase
            .from('tickets')
            .select('*, profiles(full_name, email)')
            .order('created_at', { ascending: false })
            .limit(50)
          
          if (data) {
            setTickets(data)
          }
        }
      )
      .subscribe()

    const verificationsChannel = supabase
      .channel('verifications-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        async () => {
          // Refetch pending verifications
          const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('student_verified', false)
            .not('student_school', 'is', null)
            .order('created_at', { ascending: false })
          
          if (data) {
            setVerifications(data)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(ticketsChannel)
      supabase.removeChannel(verificationsChannel)
    }
  }, [supabase])

  async function approveStudent(userId: string) {
    const { error } = await supabase
      .from('profiles')
      .update({
        tier: 'student',
        student_verified: true,
        student_verified_at: new Date().toISOString(),
        storage_limit: 50 * 1024 * 1024 * 1024, // 50 GB
        upload_limit: 20 * 1024 * 1024 * 1024, // 20 GB
        ai_daily_limit: 200,
      })
      .eq('id', userId)

    if (error) {
      toast.error('Failed to approve student')
      return
    }

    // Send notification
    await supabase.from('notifications').insert({
      user_id: userId,
      type: 'student_verified',
      title: 'Student Status Approved!',
      message: 'Congratulations! Your student status has been verified. Enjoy 50GB storage and 200 AI requests daily!',
    })

    setVerifications(prev => prev.filter(v => v.id !== userId))
    toast.success('Student approved successfully')
  }

  async function rejectStudent(userId: string) {
    const { error } = await supabase
      .from('profiles')
      .update({
        student_school: null,
      })
      .eq('id', userId)

    if (error) {
      toast.error('Failed to reject application')
      return
    }

    // Send notification
    await supabase.from('notifications').insert({
      user_id: userId,
      type: 'system',
      title: 'Student Verification Rejected',
      message: 'Your student verification was not approved. Please ensure you use a valid school email address.',
    })

    setVerifications(prev => prev.filter(v => v.id !== userId))
    toast.success('Application rejected')
  }

  const filteredVerifications = verifications.filter(v => 
    v.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.student_school?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredTickets = tickets.filter(t =>
    t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.profiles?.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const statusColors = {
    open: 'bg-amber-100 text-amber-700',
    in_progress: 'bg-blue-100 text-blue-700',
    resolved: 'bg-green-100 text-green-700',
    closed: 'bg-muted text-muted-foreground',
  }

  const priorityColors = {
    low: 'bg-muted text-muted-foreground',
    medium: 'bg-amber-100 text-amber-700',
    high: 'bg-red-100 text-red-700',
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-40">
        <div className="container mx-auto flex h-14 items-center gap-4 px-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <ZonixLogo size="sm" />
          <span className="font-semibold">Support Panel</span>
          <Badge variant="outline" className="ml-2 capitalize">{profile.role}</Badge>
          
          <div className="ml-auto flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                className="pl-10 w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 container mx-auto px-4 py-6">
        <Tabs defaultValue="verifications" className="space-y-6">
          <TabsList>
            <TabsTrigger value="verifications" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Student Verifications
              {verifications.length > 0 && (
                <Badge variant="secondary">{verifications.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="tickets" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Support Tickets
              {tickets.filter(t => t.status === 'open').length > 0 && (
                <Badge variant="secondary">{tickets.filter(t => t.status === 'open').length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Student Verifications Tab */}
          <TabsContent value="verifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pending Student Verifications</CardTitle>
                <CardDescription>
                  Review and approve student verification requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredVerifications.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                    <p className="text-lg font-medium">All caught up!</p>
                    <p className="text-muted-foreground">No pending verification requests</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredVerifications.map((verification) => (
                      <div
                        key={verification.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <Avatar>
                            <AvatarImage src={verification.avatar_url || undefined} />
                            <AvatarFallback>
                              <User className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{verification.full_name || 'Unknown'}</p>
                            <p className="text-sm text-muted-foreground">{verification.email}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                <GraduationCap className="h-3 w-3 mr-1" />
                                {verification.student_school}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                <Clock className="h-3 w-3 inline mr-1" />
                                {new Date(verification.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => rejectStudent(verification.id)}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => approveStudent(verification.id)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Support Tickets Tab */}
          <TabsContent value="tickets" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Support Tickets</CardTitle>
                <CardDescription>
                  Manage and respond to user support requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredTickets.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-lg font-medium">No tickets found</p>
                    <p className="text-muted-foreground">All support tickets are resolved</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredTickets.map((ticket) => (
                      <Link
                        key={ticket.id}
                        href={`/support-panel/ticket/${ticket.id}`}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`h-2 w-2 rounded-full ${
                            ticket.status === 'open' ? 'bg-amber-500' :
                            ticket.status === 'in_progress' ? 'bg-blue-500' :
                            'bg-green-500'
                          }`} />
                          <div>
                            <p className="font-medium">{ticket.subject}</p>
                            <p className="text-sm text-muted-foreground">
                              {ticket.profiles?.email || 'Unknown user'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={priorityColors[ticket.priority as keyof typeof priorityColors]}>
                            {ticket.priority}
                          </Badge>
                          <Badge className={statusColors[ticket.status as keyof typeof statusColors]}>
                            {ticket.status.replace('_', ' ')}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(ticket.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
