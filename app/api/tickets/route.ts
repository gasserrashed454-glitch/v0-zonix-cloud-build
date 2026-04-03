import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: tickets, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ tickets })
  } catch (error) {
    console.error('Get tickets error:', error)
    return NextResponse.json({ error: 'Failed to get tickets' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.log('[v0] Ticket POST: User not authenticated')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { subject, description, priority } = await request.json()

    if (!subject || !description) {
      console.log('[v0] Ticket POST: Missing subject or description')
      return NextResponse.json({ error: 'Subject and description required' }, { status: 400 })
    }

    console.log('[v0] Creating ticket for user:', user.id, 'Subject:', subject)

    const { data: ticket, error } = await supabase
      .from('tickets')
      .insert({
        user_id: user.id,
        subject,
        description,
        priority: priority || 1,
        status: 'open',
      })
      .select()
      .single()

    if (error) {
      console.error('[v0] Ticket creation error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('[v0] Ticket created successfully:', ticket.id)

    // Log activity
    await supabase.from('activity_logs').insert({
      user_id: user.id,
      action: 'ticket_created',
      details: { ticket_id: ticket.id, subject },
    })

    return NextResponse.json({ ticket })
  } catch (error) {
    console.error('[v0] Create ticket error:', error)
    return NextResponse.json({ error: 'Failed to create ticket' }, { status: 500 })
  }
}
