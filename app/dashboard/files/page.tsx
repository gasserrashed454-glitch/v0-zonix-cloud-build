import { createClient } from '@/lib/supabase/server'
import { FileManager } from '@/components/dashboard/file-manager'

export default async function FilesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const [filesResult, foldersResult] = await Promise.all([
    supabase
      .from('files')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_trashed', false)
      .is('folder_id', null)
      .order('created_at', { ascending: false }),
    supabase
      .from('folders')
      .select('*')
      .eq('user_id', user.id)
      .is('parent_id', null)
      .order('name', { ascending: true }),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">My Files</h1>
        <p className="text-muted-foreground">Manage all your files and folders</p>
      </div>
      <FileManager
        userId={user.id}
        currentFolderId={null}
        initialFiles={filesResult.data || []}
        initialFolders={foldersResult.data || []}
        breadcrumbs={[{ id: null, name: 'My Files' }]}
      />
    </div>
  )
}
