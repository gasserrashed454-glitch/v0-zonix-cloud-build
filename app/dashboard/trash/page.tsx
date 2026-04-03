import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { TrashContent } from '@/components/dashboard/trash-content'

export default async function TrashPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  const { data: trashedFiles } = await supabase
    .from('files')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_trashed', true)
    .order('trashed_at', { ascending: false })

  return (
    <div className="flex-1 overflow-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Trash</h1>
      <TrashContent userId={user.id} files={trashedFiles || []} />
    </div>
  )
}
