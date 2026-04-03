import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SharedFilesContent } from '@/components/dashboard/shared-files-content'

export default async function SharedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  const { data: sharedFiles } = await supabase
    .from('shared_files')
    .select('*, files(*)')
    .eq('shared_with', user.id)

  return (
    <div className="flex-1 overflow-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Shared with Me</h1>
      <SharedFilesContent files={sharedFiles || []} />
    </div>
  )
}
