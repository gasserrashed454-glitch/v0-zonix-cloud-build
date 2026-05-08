import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(
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

    // Check staff role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !['admin', 'mod', 'support'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const updates = await request.json()

    // Only allow certain fields
    const allowedUpdates = ['status', 'assigned_to', 'priority']
    const filteredUpdates: Record<string, unknown> = {}
    
    for (const key of allowedUpdates) {
      if (key in updates) {
        filteredUpdates[key] = updates[key]
      }
    }

    const { data: ticket, error } = await supabase
      .from('tickets')
      .update(filteredUpdates)
      .eq('id', ticketId)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Log action
    await supabase.from('activity_logs').insert({
      user_id: user.id,
      action: 'admin_update_ticket',
      details: { ticket_id: ticketId, updates: filteredUpdates },
    })

    return NextResponse.json({ ticket })
  } catch (error) {
    console.error('Update ticket error:', error)
    return NextResponse.json({ error: 'Failed to update ticket' }, { status: 500 })
  }
}
