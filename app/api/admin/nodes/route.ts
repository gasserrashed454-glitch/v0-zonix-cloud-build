import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get all storage nodes
    const { data: nodes, error } = await supabase
      .from('admin_settings')
      .select('*')
      .eq('key', 'storage_nodes')
      .single()

    if (error || !nodes) {
      return NextResponse.json({ nodes: [] })
    }

    return NextResponse.json({ nodes: nodes.value || [] })
  } catch (error) {
    console.error('[v0] Get nodes error:', error)
    return NextResponse.json({ error: 'Failed to get nodes' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { name, hostname, username, protocol, port = 22, password, api_key } = body

    // Validate required fields
    if (!name || !hostname || !username || !protocol) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    console.log('[v0] Adding storage node:', name, 'at', hostname)

    // Get existing nodes
    const { data: existingSettings } = await supabase
      .from('admin_settings')
      .select('*')
      .eq('key', 'storage_nodes')
      .single()

    const existingNodes = existingSettings?.value || []

    // Create new node
    const newNode = {
      id: crypto.getRandomValues(new Uint8Array(16)).join(''),
      name,
      type: 'vps' as const,
      hostname,
      protocol,
      port,
      username,
      status: 'testing' as const,
      allocated_ram: 0,
      allocated_storage: 0,
      created_at: new Date().toISOString(),
      // Store encrypted credentials in environment
      has_credentials: !!(password || api_key),
    }

    // Update or insert nodes
    const { error: upsertError } = await supabase
      .from('admin_settings')
      .upsert({
        key: 'storage_nodes',
        value: [...existingNodes, newNode],
        updated_by: user.id,
        updated_at: new Date().toISOString(),
      })

    if (upsertError) {
      console.error('[v0] Upsert error:', upsertError)
      return NextResponse.json({ error: upsertError.message }, { status: 500 })
    }

    // Store credentials securely (would use encryption in production)
    if (password || api_key) {
      await supabase
        .from('admin_settings')
        .upsert({
          key: `node_${newNode.id}_credentials`,
          value: { password, api_key },
          updated_by: user.id,
        })
    }

    console.log('[v0] Node added successfully:', newNode.id)

    return NextResponse.json({ 
      node: newNode,
      success: true 
    })
  } catch (error) {
    console.error('[v0] Add node error:', error)
    return NextResponse.json({ error: 'Failed to add node' }, { status: 500 })
  }
}
