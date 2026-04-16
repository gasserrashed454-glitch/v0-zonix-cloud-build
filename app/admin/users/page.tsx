import { createClient } from '@/lib/supabase/server'
import { UsersTable } from '@/components/admin/users-table'

export default async function AdminUsersPage() {
  const supabase = await createClient()

  const { data: users } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="flex-1 p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">User Management</h1>
        <p className="text-muted-foreground">View and manage all user accounts</p>
      </div>

      <UsersTable initialUsers={users || []} />
    </div>
  )
}
