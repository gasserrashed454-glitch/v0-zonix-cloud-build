import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import crypto from 'crypto'

const ENCRYPTION_KEY = process.env.STORAGE_ENCRYPTION_KEY || 'default-key-change-in-production'
const IV_LENGTH = 16

function encryptPassword(password: string): string {
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32)), iv)
  let encrypted = cipher.update(password, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  return iv.toString('hex') + ':' + encrypted
}

function decryptPassword(encrypted: string): string {
  const parts = encrypted.split(':')
  const iv = Buffer.from(parts[0], 'hex')
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32)), iv)
  let decrypted = decipher.update(parts[1], 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  return decrypted
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify admin role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { data: servers, error } = await supabase
      .from('vps_storage_servers')
      .select(`
        id,
        alias,
        hostname,
        ip_address,
        protocol,
        total_storage,
        connection_status,
        last_health_check,
        created_at,
        vps_storage_allocations (
          id,
          allocation_type,
          allocation_value,
          allocated_to,
          used_storage
        )
      `)
      .order('created_at', { ascending: false })

    if (error) throw error

    // Remove encrypted passwords from response
    const safeServers = servers?.map(({ password, ...rest }: any) => rest) || []

    return NextResponse.json({ servers: safeServers })
  } catch (error) {
    console.error('[LOG] VPS servers GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch servers' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify admin role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { alias, hostname, ip_address, port, username, password, protocol, total_storage } = body

    if (!alias || !hostname || !ip_address || !username || !password || !protocol || !total_storage) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const encryptedPassword = encryptPassword(password)

    const { data: server, error } = await supabase
      .from('vps_storage_servers')
      .insert({
        alias,
        hostname,
        ip_address,
        port: port || 22,
        username,
        password: encryptedPassword,
        protocol,
        total_storage: parseInt(total_storage) * 1024 * 1024 * 1024, // Convert GB to bytes
        created_by: user.id,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ server: { ...server, password: undefined } }, { status: 201 })
  } catch (error) {
    console.error('[LOG] VPS servers POST error:', error)
    return NextResponse.json({ error: 'Failed to create server' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify admin role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const serverId = searchParams.get('id')

    if (!serverId) {
      return NextResponse.json({ error: 'Server ID required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('vps_storage_servers')
      .delete()
      .eq('id', serverId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[LOG] VPS servers DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete server' }, { status: 500 })
  }
}
