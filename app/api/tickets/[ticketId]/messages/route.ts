import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  try {
    const { ticketId } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user owns the ticket or is staff
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const isStaff = profile && ['admin', 'mod', 'support'].includes(profile.role)

    const { data: ticket } = await supabase
      .from('tickets')
      .select('user_id')
      .eq('id', ticketId)
      .single()

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    if (ticket.user_id !== user.id && !isStaff) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get messages
    let query = supabase
      .from('ticket_messages')
      .select('*')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true })

    // Hide internal messages from regular users
    if (!isStaff) {
      query = query.eq('is_internal', false)
    }

    const { data: messages, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ messages })
  } catch (error) {
    console.error('Get messages error:', error)
    return NextResponse.json({ error: 'Failed to get messages' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  try {
    const { ticketId } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { message, isInternal } = await request.json()

    if (!message) {
      return NextResponse.json({ error: 'Message required' }, { status: 400 })
    }

    // Check if user has access to ticket
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const isStaff = profile && ['admin', 'mod', 'support'].includes(profile.role)

    const { data: ticket } = await supabase
      .from('tickets')
      .select('user_id, status')
      .eq('id', ticketId)
      .single()

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    if (ticket.user_id !== user.id && !isStaff) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (ticket.status === 'closed') {
      return NextResponse.json({ error: 'Ticket is closed' }, { status: 400 })
    }

    // Create message
    const { data: newMessage, error } = await supabase
      .from('ticket_messages')
      .insert({
        ticket_id: ticketId,
        sender_id: user.id,
        message,
        is_internal: isStaff && isInternal ? true : false,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Update ticket status if staff responds
    if (isStaff && ticket.status === 'open') {
      await supabase
        .from('tickets')
        .update({ status: 'in_progress' })
        .eq('id', ticketId)
    }

    return NextResponse.json({ message: newMessage })
  } catch (error) {
    console.error('Create message error:', error)
    return NextResponse.json({ error: 'Failed to create message' }, { status: 500 })
  }
}
