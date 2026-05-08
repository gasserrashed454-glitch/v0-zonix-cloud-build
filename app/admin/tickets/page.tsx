import { createClient } from '@/lib/supabase/server'
import { AdminTicketsContent } from '@/components/admin/tickets-content'

export default async function AdminTicketsPage() {
  const supabase = await createClient()

  const { data: tickets } = await supabase
    .from('tickets')
    .select('*, profiles(email, full_name)')
    .order('created_at', { ascending: false })

  const { data: staffMembers } = await supabase
    .from('profiles')
    .select('id, email, full_name, role')
    .in('role', ['admin', 'mod', 'support'])

  return (
    <div className="flex-1 p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Support Tickets</h1>
        <p className="text-muted-foreground">Manage and respond to user support requests</p>
      </div>

      <AdminTicketsContent 
        initialTickets={tickets || []} 
        staffMembers={staffMembers || []} 
      />
    </div>
  )
}
