import { streamText } from 'ai'
import { google } from '@ai-sdk/google'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { TIER_FEATURES, getTierDescription } from '@/lib/tier-features'
import { convertToModelMessages } from 'ai'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile for tier info
    const { data: profile } = await supabase
      .from('profiles')
      .select('tier, storage_used, storage_limit, ai_uses_today, ai_uses_limit')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const { messages } = await req.json()

    // Build system prompt with tier info
    const tierInfo = TIER_FEATURES[profile.tier as keyof typeof TIER_FEATURES] || TIER_FEATURES.free
    const systemPrompt = `You are Zonix AI Assistant, a helpful assistant for the Zonix Cloud storage platform.

USER TIER INFORMATION:
- Current Plan: ${tierInfo.name}
- Storage Used: ${Math.round(profile.storage_used / (1024 * 1024 * 1024))} GB / ${tierInfo.storage}
- AI Queries Today: ${profile.ai_uses_today} / ${profile.ai_uses_limit || 'Unlimited'}

TIER FEATURES:
${Object.entries(TIER_FEATURES)
  .map(
    ([key, tier]) =>
      `${tier.name}:
  - Storage: ${tier.storage}
  - Max Upload: ${tier.uploadLimit}
  - Price: ${tier.price}
  - AI Daily Limit: ${tier.ai.dailyLimit ? tier.ai.dailyLimit + ' queries' : 'Unlimited'}
  - Key Features: ${tier.features.slice(0, 4).join(', ')}`
  )
  .join('\n\n')}

PLATFORM FEATURES:
- File storage and management with drag-and-drop interface
- File sharing with customizable permissions
- Real-time file collaboration
- Advanced file preview for 100+ formats
- AI-powered file organization and tagging
- Support tickets and help documentation
- Version history and file recovery
- Secure sharing with expiration dates

You can help users with:
1. Understanding their current plan and storage usage
2. Explaining features available in each tier
3. Helping them upgrade to a better plan
4. Answering questions about file management
5. Explaining how to share files and collaborate
6. Troubleshooting common issues
7. Information about the platform

Always be helpful, friendly, and provide specific information about their tier. If they ask about upgrading, explain the benefits of higher tiers.`

    // Convert messages to model format
    const modelMessages = await convertToModelMessages(messages)

    const result = streamText({
      model: google('gemini-1.5-flash'),
      system: systemPrompt,
      messages: modelMessages,
      temperature: 0.7,
      maxTokens: 1024,
    })

    return result.toUIMessageStreamResponse()
  } catch (error) {
    console.error('AI Assistant error:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}
