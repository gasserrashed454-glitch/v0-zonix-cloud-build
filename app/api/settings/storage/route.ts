import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { malware_scan_enabled, password_protection_enabled, storage_password } = await request.json()

    // Store settings in profile
    const { error } = await supabase
      .from('profiles')
      .update({
        malware_scan_enabled,
        password_protection_enabled,
        storage_password: password_protection_enabled ? Buffer.from(storage_password).toString('base64') : null,
      })
      .eq('id', user.id)

    if (error) {
      console.error('[LOG] Storage settings error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('[LOG] Storage settings updated for user:', user.id)

    return NextResponse.json({ success: true, message: 'Settings saved' })
  } catch (error) {
    console.error('[LOG] Storage settings error:', error)
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 })
  }
}
