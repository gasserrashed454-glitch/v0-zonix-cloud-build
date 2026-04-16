import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { RecentContent } from '@/components/dashboard/recent-content'

export default async function RecentPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  const { data: recentFiles } = await supabase
    .from('files')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_trashed', false)
    .order('updated_at', { ascending: false })
    .limit(20)

  return (
    <div className="flex-1 overflow-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Recent Files</h1>
      <RecentContent userId={user.id} files={recentFiles || []} />
    </div>
  )
}
