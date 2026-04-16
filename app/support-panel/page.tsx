import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SupportPanelContent } from '@/components/support/support-panel-content'

export default async function SupportPanelPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Only allow admin, mod, or support roles
  if (!profile || !['admin', 'mod', 'support'].includes(profile.role)) {
    redirect('/dashboard')
  }

  // Fetch pending student verifications
  const { data: pendingVerifications } = await supabase
    .from('profiles')
    .select('*')
    .eq('student_verified', false)
    .not('student_school', 'is', null)
    .order('created_at', { ascending: false })

  // Fetch recent tickets
  const { data: tickets } = await supabase
    .from('tickets')
    .select('*, profiles(full_name, email)')
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div className="min-h-screen bg-background">
      <SupportPanelContent 
        profile={profile} 
        pendingVerifications={pendingVerifications || []}
        tickets={tickets || []}
      />
    </div>
  )
}
