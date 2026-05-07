import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import * as speakeasy from 'speakeasy'
import * as QRCode from 'qrcode'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { action } = await req.json()

    if (action === 'generate') {
      // Generate new 2FA secret
      const secret = speakeasy.generateSecret({
        name: `Zonix Cloud (${user.email})`,
        issuer: 'Zonix Cloud',
        length: 32,
      })

      // Generate QR code
      const qrCode = await QRCode.toDataURL(secret.otpauth_url!)

      return NextResponse.json({
        secret: secret.base32,
        qrCode,
        manualEntry: secret.base32,
      })
    }

    if (action === 'verify') {
      const { secret, token } = await req.json()

      // Verify the token
      const verified = speakeasy.totp.verify({
        secret,
        encoding: 'base32',
        token,
        window: 2,
      })

      if (!verified) {
        return NextResponse.json(
          { error: 'Invalid verification code' },
          { status: 400 }
        )
      }

      // Enable 2FA in database
      await supabase
        .from('profiles')
        .update({
          two_fa_enabled: true,
          two_fa_secret: secret,
        })
        .eq('id', user.id)

      return NextResponse.json({ success: true })
    }

    if (action === 'disable') {
      // Disable 2FA
      await supabase
        .from('profiles')
        .update({
          two_fa_enabled: false,
          two_fa_secret: null,
        })
        .eq('id', user.id)

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('[v0] 2FA error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
