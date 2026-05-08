import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { email } = await req.json()

    // Check if user exists
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      )
    }

    // Create shared file record
    const { data, error } = await supabase
      .from('shared_files')
      .insert({
        shared_with_email: email,
        permission: 'view',
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Share error:', error)
    return NextResponse.json({ error: 'Failed to share' }, { status: 500 })
  }
}
