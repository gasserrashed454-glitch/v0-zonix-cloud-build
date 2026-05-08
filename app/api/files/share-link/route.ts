import { createClient } from '@/lib/supabase/server'
import { generateShareCode, generateShareUrl } from '@/lib/file-sharing'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { fileId, expiresIn } = await req.json()

    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify file ownership
    const { data: file, error: fileError } = await supabase
      .from('files')
      .select('id, user_id')
      .eq('id', fileId)
      .single()

    if (fileError || !file || file.user_id !== user.id) {
      return NextResponse.json({ error: 'File not found or not owned by user' }, { status: 404 })
    }

    // Generate share code
    const shareCode = generateShareCode()
    const shareUrl = generateShareUrl(shareCode)
    let expiresAt = null

    if (expiresIn) {
      const date = new Date()
      switch (expiresIn) {
        case '1hour':
          date.setHours(date.getHours() + 1)
          break
        case '1day':
          date.setDate(date.getDate() + 1)
          break
        case '7days':
          date.setDate(date.getDate() + 7)
          break
        case '30days':
          date.setDate(date.getDate() + 30)
          break
      }
      expiresAt = date.toISOString()
    }

    // Save share link to database
    const { data: shareRecord, error: shareError } = await supabase
      .from('file_shares')
      .insert({
        file_id: fileId,
        share_code: shareCode,
        shared_by: user.id,
        expires_at: expiresAt,
        access_count: 0,
      })
      .select()
      .single()

    if (shareError) {
      console.error('[v0] Share creation error:', shareError)
      return NextResponse.json(
        { error: 'Failed to create share link' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      shareCode,
      shareUrl,
      expiresAt,
      createdAt: shareRecord.created_at,
    })
  } catch (error) {
    console.error('[v0] Share link error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const fileId = searchParams.get('fileId')

    if (!fileId) {
      return NextResponse.json({ error: 'fileId required' }, { status: 400 })
    }

    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all active share links for this file
    const { data: shares, error: sharesError } = await supabase
      .from('file_shares')
      .select('*')
      .eq('file_id', fileId)
      .eq('shared_by', user.id)
      .or('expires_at.is.null,expires_at.gt.now()')
      .order('created_at', { ascending: false })

    if (sharesError) {
      return NextResponse.json({ error: 'Failed to fetch shares' }, { status: 500 })
    }

    return NextResponse.json({
      shares: shares.map((share) => ({
        ...share,
        shareUrl: generateShareUrl(share.share_code),
      })),
    })
  } catch (error) {
    console.error('[v0] Get shares error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: Request) {
  try {
    const { shareCode } = await req.json()

    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Delete share link
    const { error: deleteError } = await supabase
      .from('file_shares')
      .delete()
      .eq('share_code', shareCode)
      .eq('shared_by', user.id)

    if (deleteError) {
      return NextResponse.json({ error: 'Failed to delete share' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[v0] Delete share error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
