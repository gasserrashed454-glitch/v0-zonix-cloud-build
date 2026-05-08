import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import speakeasy from 'speakeasy'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { secret, code, backupCodes } = await request.json()

    if (!secret || !code) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Verify TOTP code
    const verified = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token: code,
      window: 2, // Allow 30 seconds of drift
    })

    if (!verified) {
      return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 })
    }

    // Store 2FA configuration
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        two_fa_enabled: true,
        two_fa_secret: secret,
        backup_codes: JSON.stringify(backupCodes || []),
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('[LOG] Failed to store 2FA:', updateError)
      return NextResponse.json({ error: 'Failed to enable 2FA' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: '2FA enabled successfully',
      backupCodes: backupCodes || [],
    })
  } catch (error) {
    console.error('[LOG] 2FA verify error:', error)
    return NextResponse.json({ error: 'Failed to verify 2FA' }, { status: 500 })
  }
}
