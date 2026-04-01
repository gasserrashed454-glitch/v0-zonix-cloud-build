import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { FavoritesContent } from '@/components/dashboard/favorites-content'

export default async function FavoritesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  const { data: favoriteFiles } = await supabase
    .from('files')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_favorite', true)
    .eq('is_trashed', false)
    .order('updated_at', { ascending: false })

  return (
    <div className="flex-1 overflow-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Favorites</h1>
      <FavoritesContent userId={user.id} files={favoriteFiles || []} />
    </div>
  )
}
