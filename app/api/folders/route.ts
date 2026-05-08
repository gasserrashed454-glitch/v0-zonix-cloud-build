import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, parentId } = await request.json()

    if (!name) {
      return NextResponse.json({ error: 'Folder name required' }, { status: 400 })
    }

    // Build path
    let path = '/'
    if (parentId) {
      const { data: parent } = await supabase
        .from('folders')
        .select('path, name')
        .eq('id', parentId)
        .single()
      
      if (parent) {
        path = `${parent.path}${parent.name}/`
      }
    }

    const { data: folder, error } = await supabase
      .from('folders')
      .insert({
        user_id: user.id,
        name,
        parent_id: parentId || null,
        path,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ folder })
  } catch (error) {
    console.error('Create folder error:', error)
    return NextResponse.json({ error: 'Failed to create folder' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { folderId } = await request.json()

    if (!folderId) {
      return NextResponse.json({ error: 'Folder ID required' }, { status: 400 })
    }

    // Delete folder (cascades to subfolders and moves files to root)
    const { error } = await supabase
      .from('folders')
      .delete()
      .eq('id', folderId)
      .eq('user_id', user.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete folder error:', error)
    return NextResponse.json({ error: 'Failed to delete folder' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { folderId, name } = await request.json()

    if (!folderId || !name) {
      return NextResponse.json({ error: 'Folder ID and name required' }, { status: 400 })
    }

    const { data: folder, error } = await supabase
      .from('folders')
      .update({ name })
      .eq('id', folderId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ folder })
  } catch (error) {
    console.error('Update folder error:', error)
    return NextResponse.json({ error: 'Failed to update folder' }, { status: 500 })
  }
}
