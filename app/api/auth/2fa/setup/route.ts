import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import speakeasy from 'speakeasy'
import QRCode from 'qrcode'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { action } = await request.json()

    if (action === 'generate') {
      // Generate new TOTP secret
      const secret = speakeasy.generateSecret({
        name: `Zonix Cloud (${user.email})`,
        issuer: 'Zonix Cloud',
        length: 32,
      })

      if (!secret.otpauth_url) {
        throw new Error('Failed to generate TOTP secret')
      }

      // Generate QR code
      const qrCode = await QRCode.toDataURL(secret.otpauth_url)

      return NextResponse.json({
        secret: secret.base32,
        qrCode,
        backupCodes: generateBackupCodes(),
      })
    } else if (action === 'verify') {
      return NextResponse.json({ error: 'Use /verify endpoint' }, { status: 400 })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('[v0] 2FA setup error:', error)
    return NextResponse.json({ error: 'Failed to setup 2FA' }, { status: 500 })
  }
}

function generateBackupCodes(): string[] {
  const codes: string[] = []
  for (let i = 0; i < 8; i++) {
    const code = Math.random().toString(36).substring(2, 10).toUpperCase()
    codes.push(code)
  }
  return codes
}
