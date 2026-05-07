import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

// Encrypt sensitive data
function encryptPassword(password: string): string {
  const key = process.env.ENCRYPTION_KEY || 'default-key-change-in-production'
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key.padEnd(32, '0')), iv)
  let encrypted = cipher.update(password, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  return iv.toString('hex') + ':' + encrypted
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, type, hostname, port, username, password, protocol, user_id } = await req.json()

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    // Encrypt password before storing
    const encryptedPassword = encryptPassword(password)

    // Create storage connection
    const { data, error } = await supabase
      .from('storage_connections')
      .insert({
        user_id: user.id,
        name,
        type,
        hostname,
        port: parseInt(port),
        username,
        password: encryptedPassword,
        protocol,
        status: 'inactive',
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    // Return connection info without password
    const { password: _, ...safe } = data
    return NextResponse.json(safe)
  } catch (error) {
    console.error('[v0] Storage connection error:', error)
    return NextResponse.json(
      { error: 'Failed to create storage connection' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('storage_connections')
      .select('id,name,type,hostname,status,created_at')
      .eq('user_id', user.id)

    if (error) {
      throw error
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('[v0] Get connections error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch connections' },
      { status: 500 }
    )
  }
}
