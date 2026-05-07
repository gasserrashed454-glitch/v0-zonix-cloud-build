import { NextRequest, NextResponse } from 'next/server'
import { generateText } from 'ai'
import { groq } from '@ai-sdk/groq'

export async function POST(request: NextRequest) {
  try {
    const { message, history } = await request.json()

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    console.log('[v0] AI Assistant received message:', message)

    const conversationHistory = history?.map((msg: { role: string; content: string }) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    })) || []

    const systemPrompt = `You are Zonix Cloud AI Assistant, a helpful and friendly AI. You help users with questions about Zonix Cloud storage service.

ZONIX CLOUD PRICING TIERS:
1. FREE TIER - $0/month
   - 5GB storage
   - 2GB upload limit per file
   - AI Assistant (50 uses/day)
   - Basic file management
   - File sharing & web access

2. STUDENT TIER - FREE for 2 months (with school email verification)
   - 20GB storage
   - 10GB upload limit per file
   - Unlimited AI Assistant access
   - AI File Organization
   - Priority support

3. PRO TIER - $2.50/month
   - 250GB storage
   - 25GB upload limit per file
   - Unlimited AI Assistant
   - Team management (up to 5 members)
   - Storage allocation tools
   - Advanced sharing controls
   - Priority support

4. BUSINESS TIER - $5.00/month
   - 1TB storage (1000GB)
   - 100GB upload limit per file
   - Unlimited AI Assistant
   - Unlimited team members
   - Advanced storage allocation
   - Custom team quotas
   - Advanced analytics
   - Priority support

GUIDELINES:
- Be helpful, concise, and friendly
- Answer pricing and feature questions accurately
- Recommend Pro for small teams, Business for large teams
- Student tier is free for 2 months with school email verification
- Always mention support at gasserrashed454@gmail.com for complex issues
- Use bullet points for features
- Keep responses under 150 words`

    console.log('[v0] Calling Groq with', conversationHistory.length + 1, 'messages')

    const result = await generateText({
      model: groq('mixtral-8x7b-32768'),
      system: systemPrompt,
      messages: [
        ...conversationHistory,
        { role: 'user' as const, content: message }
      ],
      maxOutputTokens: 300,
    })

    console.log('[v0] Groq response:', result.text.substring(0, 50) + '...')

    return NextResponse.json({ 
      response: result.text,
      success: true 
    })
  } catch (error) {
    console.error('[v0] AI error:', error)
    return NextResponse.json(
      { 
        error: 'AI service temporarily unavailable',
        response: 'Sorry, our AI assistant is temporarily unavailable. Please contact support@zonix.cloud or try again in a moment.'
      },
      { status: 500 }
    )
  }
}
