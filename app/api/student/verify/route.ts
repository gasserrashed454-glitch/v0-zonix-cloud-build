import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Common educational email domains
const educationalDomains = [
  '.edu',
  '.ac.uk',
  '.edu.au',
  '.edu.cn',
  '.edu.in',
  '.edu.sg',
  '.ac.jp',
  '.edu.my',
  '.edu.ph',
  '.edu.pk',
  '.edu.ng',
  '.edu.eg',
  '.edu.br',
  '.edu.mx',
  '.edu.ar',
  '.edu.co',
  '.edu.pe',
  '.edu.ec',
  '.edu.ve',
]

function isEducationalEmail(email: string): boolean {
  const domain = email.toLowerCase()
  return educationalDomains.some(eduDomain => domain.endsWith(eduDomain))
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { schoolEmail, code } = await request.json()

    if (!schoolEmail) {
      return NextResponse.json({ error: 'School email required' }, { status: 400 })
    }

    // Check if it's an educational email
    if (!isEducationalEmail(schoolEmail)) {
      return NextResponse.json({ 
        error: 'Please use a valid educational email address (.edu, .ac.uk, etc.)' 
      }, { status: 400 })
    }

    // If no code provided, send verification code
    if (!code) {
      // Generate 6-digit code
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
      
      // Store verification code (expires in 10 minutes)
      const { error: insertError } = await supabase
        .from('verification_codes')
        .insert({
          email: schoolEmail,
          code: verificationCode,
          type: 'student_verification',
          expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
        })

      if (insertError) {
        console.error('Insert error:', insertError)
        return NextResponse.json({ error: 'Failed to create verification code' }, { status: 500 })
      }

      // In production, send email via Resend
      // For now, we'll log it (you would integrate Resend here)
      console.log(`[STUDENT VERIFICATION] Code for ${schoolEmail}: ${verificationCode}`)
      
      // TODO: Integrate with Resend to send actual email
      // await resend.emails.send({
      //   from: 'noreply@zonixcloud.com',
      //   to: schoolEmail,
      //   subject: 'Verify your student status - Zonix Cloud',
      //   html: `Your verification code is: ${verificationCode}`
      // })

      return NextResponse.json({ 
        message: 'Verification code sent to your school email',
        // Remove this in production - only for demo
        demoCode: verificationCode 
      })
    }

    // Verify the code
    const { data: verificationRecord } = await supabase
      .from('verification_codes')
      .select('*')
      .eq('email', schoolEmail)
      .eq('code', code)
      .eq('type', 'student_verification')
      .eq('verified', false)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (!verificationRecord) {
      return NextResponse.json({ error: 'Invalid or expired code' }, { status: 400 })
    }

    // Mark code as verified
    await supabase
      .from('verification_codes')
      .update({ verified: true })
      .eq('id', verificationRecord.id)

    // Extract school name from email domain
    const schoolDomain = schoolEmail.split('@')[1]

    // Update user profile to student tier
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        tier: 'student',
        student_verified: true,
        student_school: schoolDomain,
        student_verified_at: new Date().toISOString(),
        storage_limit: 53687091200, // 50 GB
        upload_limit: 21474836480, // 20 GB
        ai_daily_limit: 999999, // Unlimited
      })
      .eq('id', user.id)

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
    }

    // Log activity
    await supabase.from('activity_logs').insert({
      user_id: user.id,
      action: 'student_verified',
      details: { school_email: schoolEmail, school: schoolDomain },
    })

    return NextResponse.json({ 
      success: true,
      message: 'Student status verified! Your account has been upgraded.' 
    })
  } catch (error) {
    console.error('Student verification error:', error)
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}
