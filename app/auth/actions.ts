'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Resend } from 'resend'

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function sendVerificationCode(email: string, type: 'signup' | 'student') {
  const code = generateCode()
  
  // Check if Resend API key is available
  const resendApiKey = process.env.RESEND_API_KEY
  if (!resendApiKey) {
    // Dev mode - return code directly without sending email
    console.log(`[DEV MODE] Verification code for ${email}: ${code}`)
    return { success: true, code, devMode: true }
  }

  const resend = new Resend(resendApiKey)
  
  try {
    await resend.emails.send({
      from: 'Zonix System <onboarding@resend.dev>',
      to: email,
      subject: type === 'signup' ? 'Verify your Zonix Cloud account' : 'Verify your student status',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #0078D4; margin: 0;">Zonix Cloud</h1>
          </div>
          <div style="background: #f8f9fa; border-radius: 8px; padding: 30px; text-align: center;">
            <h2 style="color: #1a1a1a; margin: 0 0 10px;">Your verification code</h2>
            <p style="color: #666; margin: 0 0 20px;">Enter this code to ${type === 'signup' ? 'verify your account' : 'verify your student status'}</p>
            <div style="background: #0078D4; color: white; font-size: 32px; font-weight: bold; letter-spacing: 8px; padding: 20px; border-radius: 8px; margin: 0 auto; display: inline-block;">
              ${code}
            </div>
            <p style="color: #999; font-size: 14px; margin-top: 20px;">This code expires in 10 minutes</p>
          </div>
          <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px;">
            If you didn&apos;t request this code, you can safely ignore this email.
          </p>
        </div>
      `,
    })
    
    return { success: true, code } // In production, don't return code - store securely
  } catch (error) {
    console.error('Failed to send email:', error)
    return { success: false, error: 'Failed to send verification code' }
  }
}

export async function signUp(formData: FormData) {
  const supabase = await createClient()
  
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string
  const verificationCode = formData.get('verificationCode') as string
  const expectedCode = formData.get('expectedCode') as string

  if (verificationCode !== expectedCode) {
    return { error: 'Invalid verification code' }
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
        `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard`,
      data: {
        full_name: fullName,
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  redirect('/auth/verify-email')
}

export async function signIn(formData: FormData) {
  const supabase = await createClient()
  
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  redirect('/dashboard')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}

export async function verifyStudentEmail(formData: FormData) {
  const supabase = await createClient()
  
  const studentEmail = formData.get('studentEmail') as string
  const verificationCode = formData.get('verificationCode') as string
  const expectedCode = formData.get('expectedCode') as string

  if (verificationCode !== expectedCode) {
    return { error: 'Invalid verification code' }
  }

  // Extract school domain from email
  const schoolDomain = studentEmail.split('@')[1]
  
  // Update user profile to student tier
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      tier: 'student',
      student_verified: true,
      student_school: schoolDomain,
      student_verified_at: new Date().toISOString(),
      storage_limit: 50 * 1024 * 1024 * 1024, // 50 GB
      upload_limit: 20 * 1024 * 1024 * 1024, // 20 GB
      ai_daily_limit: 200,
    })
    .eq('id', user.id)

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function getCurrentUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return profile
}
