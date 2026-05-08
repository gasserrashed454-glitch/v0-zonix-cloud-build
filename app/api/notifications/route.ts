import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { title, description, type, targetUsers, isGlobal } = await request.json()

    if (!title || !description || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const validTypes = ['alert', 'info', 'warning', 'success']
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: 'Invalid notification type' }, { status: 400 })
    }

    if (isGlobal) {
      // Send to all users
      const { data: allUsers } = await supabase
        .from('profiles')
        .select('id')

      const notifications = allUsers?.map((u) => ({
        user_id: u.id,
        title,
        description,
        type,
        is_read: false,
        created_at: new Date().toISOString(),
      })) || []

      const { error } = await supabase
        .from('notifications')
        .insert(notifications)

      if (error) throw error

      return NextResponse.json({
        success: true,
        message: `Notification sent to ${notifications.length} users`,
      })
    } else {
      // Send to specific users
      const notifications = (targetUsers || []).map((userId: string) => ({
        user_id: userId,
        title,
        description,
        type,
        is_read: false,
        created_at: new Date().toISOString(),
      }))

      if (notifications.length === 0) {
        return NextResponse.json({ error: 'No target users specified' }, { status: 400 })
      }

      const { error } = await supabase
        .from('notifications')
        .insert(notifications)

      if (error) throw error

      return NextResponse.json({
        success: true,
        message: `Notification sent to ${notifications.length} user(s)`,
      })
    }
  } catch (error) {
    console.error('[LOG] Send notification error:', error)
    return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) throw error

    const unreadCount = notifications?.filter((n) => !n.is_read).length || 0

    return NextResponse.json({
      notifications: notifications || [],
      unreadCount,
    })
  } catch (error) {
    console.error('[LOG] Fetch notifications error:', error)
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 })
  }
}
