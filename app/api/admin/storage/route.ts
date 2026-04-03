import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check admin role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { data: settings } = await supabase
      .from('storage_settings')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single()

    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Get storage settings error:', error)
    return NextResponse.json({ error: 'Failed to get settings' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check admin role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { use_azure, azure_connection_string, azure_container_name } = await request.json()

    // Upsert settings
    const { data: settings, error } = await supabase
      .from('storage_settings')
      .upsert({
        use_azure,
        azure_connection_string,
        azure_container_name,
        updated_by: user.id,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Log admin action
    await supabase.from('activity_logs').insert({
      user_id: user.id,
      action: 'admin_update_storage',
      details: { use_azure },
    })

    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Update storage settings error:', error)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}
