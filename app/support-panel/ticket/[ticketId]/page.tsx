import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { TicketDetailContent } from '@/components/support/ticket-detail-content'

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ ticketId: string }>
}) {
  const { ticketId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Only allow admin, mod, or support roles
  if (!profile || !['admin', 'mod', 'support'].includes(profile.role)) {
    redirect('/dashboard')
  }

  // Fetch ticket with user details
  const { data: ticket } = await supabase
    .from('tickets')
    .select('*, profiles(id, full_name, email, avatar_url, tier)')
    .eq('id', ticketId)
    .single()

  if (!ticket) {
    notFound()
  }

  // Fetch messages
  const { data: messages } = await supabase
    .from('ticket_messages')
    .select('*, profiles(full_name, email, avatar_url, role)')
    .eq('ticket_id', ticketId)
    .order('created_at', { ascending: true })

  return (
    <TicketDetailContent 
      profile={profile}
      ticket={ticket}
      initialMessages={messages || []}
    />
  )
}
