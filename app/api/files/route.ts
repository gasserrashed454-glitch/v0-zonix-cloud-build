import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { del } from '@vercel/blob'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const folderId = searchParams.get('folderId')
    const trashed = searchParams.get('trashed') === 'true'
    const favorites = searchParams.get('favorites') === 'true'
    const shared = searchParams.get('shared') === 'true'
    const recent = searchParams.get('recent') === 'true'

    let query = supabase.from('files').select('*').eq('user_id', user.id)

    if (trashed) {
      query = query.eq('is_trashed', true)
    } else if (favorites) {
      query = query.eq('is_favorite', true).eq('is_trashed', false)
    } else if (recent) {
      query = query.eq('is_trashed', false).order('updated_at', { ascending: false }).limit(20)
    } else if (shared) {
      // Get files shared with the user
      const { data: sharedFiles } = await supabase
        .from('shared_files')
        .select('file_id, files(*)')
        .eq('shared_with', user.id)
      
      return NextResponse.json({ 
        files: sharedFiles?.map(sf => sf.files).filter(Boolean) || [] 
      })
    } else {
      query = query.eq('is_trashed', false)
      if (folderId) {
        query = query.eq('folder_id', folderId)
      } else {
        query = query.is('folder_id', null)
      }
    }

    const { data: files, error } = await query.order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Get folders too
    let folderQuery = supabase.from('folders').select('*').eq('user_id', user.id)
    
    if (folderId) {
      folderQuery = folderQuery.eq('parent_id', folderId)
    } else {
      folderQuery = folderQuery.is('parent_id', null)
    }

    const { data: folders } = await folderQuery.order('name')

    return NextResponse.json({ files: files || [], folders: folders || [] })
  } catch (error) {
    console.error('Get files error:', error)
    return NextResponse.json({ error: 'Failed to get files' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { fileIds, permanent } = await request.json()

    if (!fileIds || !Array.isArray(fileIds)) {
      return NextResponse.json({ error: 'File IDs required' }, { status: 400 })
    }

    if (permanent) {
      // Get file details for blob deletion
      const { data: files } = await supabase
        .from('files')
        .select('blob_url')
        .in('id', fileIds)
        .eq('user_id', user.id)

      // Delete from Vercel Blob
      if (files) {
        for (const file of files) {
          try {
            await del(file.blob_url)
          } catch (e) {
            console.error('Blob delete error:', e)
          }
        }
      }

      // Delete from database
      const { error } = await supabase
        .from('files')
        .delete()
        .in('id', fileIds)
        .eq('user_id', user.id)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
    } else {
      // Move to trash
      const { error } = await supabase
        .from('files')
        .update({ is_trashed: true, trashed_at: new Date().toISOString() })
        .in('id', fileIds)
        .eq('user_id', user.id)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete files error:', error)
    return NextResponse.json({ error: 'Failed to delete files' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { fileId, updates } = await request.json()

    if (!fileId) {
      return NextResponse.json({ error: 'File ID required' }, { status: 400 })
    }

    const allowedUpdates = ['name', 'is_favorite', 'is_trashed', 'folder_id']
    const filteredUpdates: Record<string, unknown> = {}
    
    for (const key of allowedUpdates) {
      if (key in updates) {
        filteredUpdates[key] = updates[key]
      }
    }

    // If restoring from trash
    if (updates.is_trashed === false) {
      filteredUpdates.trashed_at = null
    }

    const { data, error } = await supabase
      .from('files')
      .update(filteredUpdates)
      .eq('id', fileId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ file: data })
  } catch (error) {
    console.error('Update file error:', error)
    return NextResponse.json({ error: 'Failed to update file' }, { status: 500 })
  }
}
