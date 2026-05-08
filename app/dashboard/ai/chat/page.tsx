import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AIAssistantContent } from '@/components/dashboard/ai-chat'

export default async function ChatPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  return (
    <div className="flex-1 overflow-hidden">
      <AIAssistantContent />
    </div>
  )
}
