import { createClient } from '@/lib/supabase/server'
import { FileManager } from '@/components/dashboard/file-manager'
import { notFound } from 'next/navigation'
import { type Folder } from '@/lib/types'

interface FolderPageProps {
  params: Promise<{ folderId: string }>
}

async function getBreadcrumbs(supabase: ReturnType<typeof createClient> extends Promise<infer T> ? T : never, folderId: string): Promise<{ id: string | null; name: string }[]> {
  const breadcrumbs: { id: string | null; name: string }[] = [{ id: null, name: 'My Files' }]
  
  let currentId: string | null = folderId
  const visited = new Set<string>()
  
  while (currentId && !visited.has(currentId)) {
    visited.add(currentId)
    const { data: folder } = await supabase
      .from('folders')
      .select('id, name, parent_id')
      .eq('id', currentId)
      .single()
    
    if (folder) {
      breadcrumbs.splice(1, 0, { id: folder.id, name: folder.name })
      currentId = folder.parent_id
    } else {
      break
    }
  }
  
  return breadcrumbs
}

export default async function FolderPage({ params }: FolderPageProps) {
  const { folderId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Verify the folder exists and belongs to the user
  const { data: folder } = await supabase
    .from('folders')
    .select('*')
    .eq('id', folderId)
    .eq('user_id', user.id)
    .single()

  if (!folder) {
    notFound()
  }

  const [filesResult, foldersResult, breadcrumbs] = await Promise.all([
    supabase
      .from('files')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_trashed', false)
      .eq('folder_id', folderId)
      .order('created_at', { ascending: false }),
    supabase
      .from('folders')
      .select('*')
      .eq('user_id', user.id)
      .eq('parent_id', folderId)
      .order('name', { ascending: true }),
    getBreadcrumbs(supabase, folderId),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{folder.name}</h1>
        <p className="text-muted-foreground">Manage files in this folder</p>
      </div>
      <FileManager
        userId={user.id}
        currentFolderId={folderId}
        initialFiles={filesResult.data || []}
        initialFolders={foldersResult.data || []}
        breadcrumbs={breadcrumbs}
      />
    </div>
  )
}
