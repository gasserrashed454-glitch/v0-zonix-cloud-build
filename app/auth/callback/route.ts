import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = 'https://zonix.me'

  if (code) {
    const supabase = await createClient()
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (!exchangeError) {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const provider = user.app_metadata?.provider || 'email'

        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id, email')
          .eq('email', user.email || '')
          .maybeSingle()

        if (!existingProfile) {
          const fullName =
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            user.user_metadata?.user_name ||
            user.email?.split('@')[0] ||
            'User'

          await supabase
            .from('profiles')
            .upsert({
              id: user.id,
              email: user.email || '',
              full_name: fullName,
              tier: 'free',
              role: 'user',
              storage_limit: 5 * 1024 * 1024 * 1024,
              upload_limit: 1024 * 1024 * 1024,
              ai_daily_limit: 50,
              oauth_provider: provider,
              oauth_id: user.user_metadata?.sub || user.user_metadata?.id?.toString(),
            }, { onConflict: 'id' })
        }
      }

      return NextResponse.redirect(`${origin}/dashboard`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`)
}
