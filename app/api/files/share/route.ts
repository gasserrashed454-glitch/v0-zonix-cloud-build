import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { file_id, shared_with_id, shared_with_email, permission = 'view' } = body

  // Verify user owns the file
  const { data: file } = await supabase
    .from('files')
    .select('user_id')
    .eq('id', file_id)
    .single()

  if (!file || file.user_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data, error } = await supabase
    .from('shared_files')
    .insert({
      file_id,
      owner_id: user.id,
      shared_with_id: shared_with_id || null,
      shared_with_email: shared_with_email || null,
      permission,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json(data)
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { id } = body

  // Verify user owns the share
  const { data: share } = await supabase
    .from('shared_files')
    .select('owner_id')
    .eq('id', id)
    .single()

  if (!share || share.owner_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { error } = await supabase
    .from('shared_files')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
