import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminSidebar } from '@/components/admin/sidebar'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  // Check if user has admin/support/mod role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !['admin', 'mod', 'support'].includes(profile.role)) {
    redirect('/dashboard')
  }

  return (
    <SidebarProvider>
      <AdminSidebar userRole={profile.role} />
      <SidebarInset className="flex flex-col min-h-screen">
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
