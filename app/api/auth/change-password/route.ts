import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (password.length < 8) errors.push('Password must be at least 8 characters')
  if (!/[A-Z]/.test(password)) errors.push('Password must contain uppercase letter')
  if (!/[a-z]/.test(password)) errors.push('Password must contain lowercase letter')
  if (!/[0-9]/.test(password)) errors.push('Password must contain number')
  if (!/[!@#$%^&*]/.test(password)) errors.push('Password must contain special character (!@#$%^&*)')
  
  return { valid: errors.length === 0, errors }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { currentPassword, newPassword, confirmPassword } = await request.json()

    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json({ error: 'Passwords do not match' }, { status: 400 })
    }

    const validation = validatePassword(newPassword)
    if (!validation.valid) {
      return NextResponse.json({ errors: validation.errors }, { status: 400 })
    }

    if (currentPassword === newPassword) {
      return NextResponse.json({ error: 'New password must be different from current password' }, { status: 400 })
    }

    // Update password using Supabase
    const { error } = await supabase.auth.updateUser({ password: newPassword })

    if (error) {
      console.error('[LOG] Password update error:', error)
      return NextResponse.json({ error: 'Failed to update password' }, { status: 400 })
    }

    // Add to password history
    try {
      await supabase
        .from('password_history')
        .insert({
          user_id: user.id,
          changed_at: new Date().toISOString(),
        })
    } catch (err) {
      console.error('[LOG] Failed to log password change:', err)
      // Don't fail the request for this
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Password changed successfully' 
    })
  } catch (error) {
    console.error('[LOG] Password change error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
