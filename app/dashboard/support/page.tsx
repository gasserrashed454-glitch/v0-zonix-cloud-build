import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SupportContent } from '@/components/dashboard/support-content'

export default async function SupportPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  const { data: tickets } = await supabase
    .from('tickets')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="flex-1 overflow-auto">
      <SupportContent userId={user.id} initialTickets={tickets || []} />
    </div>
  )
}
