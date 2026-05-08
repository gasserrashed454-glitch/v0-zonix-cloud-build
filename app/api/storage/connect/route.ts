import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { encryptPassword, testSSHConnection, testSMBConnection, testNFSConnection } from '@/lib/storage/encryption'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const {
      action,
      connectionName,
      protocol,
      host,
      port,
      username,
      password,
      storagePath,
      exportPath,
    } = await request.json()

    // Validate connection name
    if (!connectionName || connectionName.length < 3) {
      return NextResponse.json({ error: 'Connection name must be at least 3 characters' }, { status: 400 })
    }

    // Validate credentials
    if (!host || !username || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    // Test connection based on protocol
    let connectionTest = { success: false, error: 'Unknown protocol' }

    switch (protocol) {
      case 'ssh':
        connectionTest = await testSSHConnection(host, username, password, port || 22)
        break
      case 'smb':
        connectionTest = await testSMBConnection(host, username, password, port || 445)
        break
      case 'nfs':
        connectionTest = await testNFSConnection(host, exportPath, port || 2049)
        break
      default:
        return NextResponse.json({ error: 'Invalid protocol' }, { status: 400 })
    }

    if (!connectionTest.success) {
      return NextResponse.json(
        { error: `Connection test failed: ${connectionTest.error}` },
        { status: 400 }
      )
    }

    // Encrypt password
    const encryptionKey = process.env.ENCRYPTION_SECRET_KEY || 'default-key-change-in-production'
    const encryptedPassword = encryptPassword(password, encryptionKey)

    // Store connection
    const { data, error } = await supabase
      .from('storage_connections')
      .insert({
        user_id: user.id,
        connection_name: connectionName,
        protocol,
        host,
        port: port || (protocol === 'ssh' ? 22 : protocol === 'smb' ? 445 : 2049),
        username,
        encrypted_password: encryptedPassword,
        storage_path: storagePath,
        export_path: exportPath,
        is_active: true,
        last_health_check: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error('[v0] Storage connection error:', error)
      return NextResponse.json({ error: 'Failed to save connection' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      connection: {
        ...data,
        encrypted_password: undefined, // Don't return encrypted password
      },
    })
  } catch (error) {
    console.error('[v0] Storage connection error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: connections, error } = await supabase
      .from('storage_connections')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Don't return encrypted passwords
    const safe = connections.map(({ encrypted_password, ...c }) => c)

    return NextResponse.json({ connections: safe })
  } catch (error) {
    console.error('[v0] Fetch connections error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { connectionId } = await request.json()

    if (!connectionId) {
      return NextResponse.json({ error: 'Missing connection ID' }, { status: 400 })
    }

    // Verify user owns this connection
    const { data: connection } = await supabase
      .from('storage_connections')
      .select('user_id')
      .eq('id', connectionId)
      .single()

    if (!connection || connection.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { error } = await supabase
      .from('storage_connections')
      .delete()
      .eq('id', connectionId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[v0] Delete connection error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
