import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Tier limits configuration
const tierLimits = {
  free: {
    storage_limit: 5368709120, // 5 GB
    upload_limit: 2147483648, // 2 GB
    ai_daily_limit: 50,
  },
  student: {
    storage_limit: 53687091200, // 50 GB
    upload_limit: 21474836480, // 20 GB
    ai_daily_limit: 999999, // Unlimited
  },
  premium: {
    storage_limit: 107374182400, // 100 GB
    upload_limit: 53687091200, // 50 GB
    ai_daily_limit: 999999, // Unlimited
  },
  enterprise: {
    storage_limit: 1099511627776, // 1 TB
    upload_limit: 107374182400, // 100 GB
    ai_daily_limit: 999999, // Unlimited
  },
}

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check admin/mod role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !['admin', 'mod'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { data: users, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ users })
  } catch (error) {
    console.error('Get users error:', error)
    return NextResponse.json({ error: 'Failed to get users' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check admin role
    const { data: adminProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!adminProfile || adminProfile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 })
    }

    const { userId, updates } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    // Only allow certain fields to be updated
    const allowedUpdates = ['tier', 'role', 'full_name', 'storage_limit', 'upload_limit', 'ai_daily_limit']
    const filteredUpdates: Record<string, unknown> = {}
    
    for (const key of allowedUpdates) {
      if (key in updates) {
        filteredUpdates[key] = updates[key]
      }
    }

    // If tier is being changed, update the limits automatically
    if (updates.tier && updates.tier in tierLimits) {
      const limits = tierLimits[updates.tier as keyof typeof tierLimits]
      filteredUpdates.storage_limit = limits.storage_limit
      filteredUpdates.upload_limit = limits.upload_limit
      filteredUpdates.ai_daily_limit = limits.ai_daily_limit
    }

    const { data: updatedUser, error } = await supabase
      .from('profiles')
      .update(filteredUpdates)
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Log admin action
    await supabase.from('activity_logs').insert({
      user_id: user.id,
      action: 'admin_update_user',
      details: { target_user: userId, updates: filteredUpdates },
    })

    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}
