import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { del } from '@vercel/blob'

export async function POST(request: NextRequest) {
  try {
    // Verify it's a valid cron request (in production, verify the auth token)
    const authHeader = request.headers.get('Authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()

    // Find all trash files older than 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    
    const { data: trashedFiles, error: fetchError } = await supabase
      .from('files')
      .select('id, blob_pathname')
      .eq('is_trashed', true)
      .lt('updated_at', oneDayAgo)

    if (fetchError) {
      console.error('Error fetching trashed files:', fetchError)
      return NextResponse.json({ error: 'Failed to fetch trashed files' }, { status: 500 })
    }

    if (!trashedFiles || trashedFiles.length === 0) {
      return NextResponse.json({ message: 'No trash files to clean up', deleted: 0 })
    }

    // Delete from Vercel Blob
    for (const file of trashedFiles) {
      try {
        if (file.blob_pathname) {
          await del(file.blob_pathname)
        }
      } catch (error) {
        console.error(`Error deleting blob ${file.blob_pathname}:`, error)
      }
    }

    // Delete from database
    const { error: deleteError } = await supabase
      .from('files')
      .delete()
      .eq('is_trashed', true)
      .lt('updated_at', oneDayAgo)

    if (deleteError) {
      console.error('Error deleting files from database:', deleteError)
      return NextResponse.json({ error: 'Failed to delete files' }, { status: 500 })
    }

    return NextResponse.json({ 
      message: `Successfully deleted ${trashedFiles.length} trash files`,
      deleted: trashedFiles.length 
    })
  } catch (error) {
    console.error('Trash cleanup error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
