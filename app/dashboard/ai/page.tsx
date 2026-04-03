import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AIPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">AI Assistant</h1>
        <p className="text-muted-foreground">
          Get help organizing and managing your files with AI
        </p>
      </div>

      <div className="bg-muted/50 rounded-lg p-8 text-center">
        <p className="text-muted-foreground mb-4">
          AI Assistant coming soon
        </p>
        <p className="text-sm text-muted-foreground">
          This feature will help you organize, tag, and search your files using artificial intelligence.
        </p>
      </div>
    </div>
  )
}
