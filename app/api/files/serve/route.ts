import { type NextRequest, NextResponse } from 'next/server'
import { get } from '@vercel/blob'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const pathname = request.nextUrl.searchParams.get('pathname')

    if (!pathname) {
      return NextResponse.json({ error: 'Missing pathname' }, { status: 400 })
    }

    // Verify user owns the file or has access
    const { data: file } = await supabase
      .from('files')
      .select('id, user_id')
      .eq('blob_pathname', pathname)
      .single()

    if (!file) {
      // Check if file is shared with user
      const { data: sharedFile } = await supabase
        .from('shared_files')
        .select('file_id, files!inner(blob_pathname)')
        .eq('shared_with', user.id)
        .single()

      if (!sharedFile) {
        return NextResponse.json({ error: 'File not found' }, { status: 404 })
      }
    } else if (file.user_id !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const result = await get(pathname, {
      access: 'private',
      ifNoneMatch: request.headers.get('if-none-match') ?? undefined,
    })

    if (!result) {
      return new NextResponse('Not found', { status: 404 })
    }

    if (result.statusCode === 304) {
      return new NextResponse(null, {
        status: 304,
        headers: {
          ETag: result.blob.etag,
          'Cache-Control': 'private, no-cache',
        },
      })
    }

    return new NextResponse(result.stream, {
      headers: {
        'Content-Type': result.blob.contentType,
        ETag: result.blob.etag,
        'Cache-Control': 'private, no-cache',
      },
    })
  } catch (error) {
    console.error('Error serving file:', error)
    return NextResponse.json({ error: 'Failed to serve file' }, { status: 500 })
  }
}
