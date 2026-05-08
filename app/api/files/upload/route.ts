'use server'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { put } from '@vercel/blob'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile to check storage limits
    const { data: profile } = await supabase
      .from('profiles')
      .select('storage_used, storage_limit, upload_limit')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const folderId = formData.get('folderId') as string | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Check upload limit
    if (file.size > profile.upload_limit) {
      return NextResponse.json({ 
        error: `File exceeds upload limit of ${(profile.upload_limit / 1024 / 1024 / 1024).toFixed(0)}GB` 
      }, { status: 400 })
    }

    // Check storage limit
    if (profile.storage_used + file.size > profile.storage_limit) {
      return NextResponse.json({ 
        error: 'Storage limit exceeded. Please upgrade your plan.' 
      }, { status: 400 })
    }

    // Upload to Vercel Blob
    const pathname = `${user.id}/${Date.now()}-${file.name}`
    const blob = await put(pathname, file, {
      access: 'private',
    })

    // Save file record to database
    const { data: fileRecord, error: dbError } = await supabase
      .from('files')
      .insert({
        user_id: user.id,
        folder_id: folderId || null,
        name: file.name,
        size: file.size,
        mime_type: file.type,
        blob_url: blob.url,
        blob_pathname: blob.pathname,
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json({ error: 'Failed to save file record' }, { status: 500 })
    }

    // Log activity
    await supabase.from('activity_logs').insert({
      user_id: user.id,
      action: 'file_upload',
      details: { file_name: file.name, file_size: file.size },
      ip_address: request.headers.get('x-forwarded-for') || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
    })

    return NextResponse.json({ file: fileRecord })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
