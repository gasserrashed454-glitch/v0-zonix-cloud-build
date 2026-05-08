import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BillingContent } from '@/components/dashboard/billing-content'

export default async function BillingPage() {
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

  const { data: invoices } = await supabase
    .from('invoices')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="flex-1 overflow-auto">
      <BillingContent profile={profile} invoices={invoices || []} />
    </div>
  )
}
