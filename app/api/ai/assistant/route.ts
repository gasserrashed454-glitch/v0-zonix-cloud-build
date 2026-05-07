import { NextRequest, NextResponse } from 'next/server'
import { generateText } from 'ai'

export async function POST(request: NextRequest) {
  try {
    const { message, context, history } = await request.json()

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    console.log('[v0] AI Assistant received message:', message)

    // Build the conversation history
    const conversationHistory = history?.map((msg: { role: string; content: string }) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    })) || []

    const systemPrompt = `You are Zonix AI Assistant, a helpful and friendly AI powered by OpenAI. You help users with questions about Zonix Cloud storage service.

IMPORTANT CONTEXT - Zonix Cloud Tiers:
- Free: 5GB storage, $0/month
- Student: 20GB storage for 2 months (free with verification)
- Pro: 250GB storage, $2.50/month (team management up to 5 members)
- Business: 1TB storage, $5.00/month (unlimited team members)

Guidelines:
- Be helpful, concise, and friendly
- Answer questions about pricing, features, storage limits, and tiers accurately
- Recommend Pro tier for small teams, Business for large organizations
- Student tier is free for 2 months with school email verification
- Always mention support email (gasserrashed454@gmail.com) for complex issues
- Keep responses brief but informative
- Use bullet points for listing features`

    console.log('[v0] Calling OpenAI API with', conversationHistory.length + 1, 'messages')

    const result = await generateText({
      model: 'openai/gpt-4-turbo',
      system: systemPrompt,
      messages: [
        ...conversationHistory,
        { role: 'user' as const, content: message }
      ],
      maxOutputTokens: 500,
    })

    console.log('[v0] OpenAI response received:', result.text.substring(0, 50) + '...')

    return NextResponse.json({ 
      response: result.text,
      success: true 
    })
  } catch (error) {
    console.error('[v0] AI Assistant error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to process request',
        response: 'I apologize, but I\'m having trouble processing your request right now. Please try again or contact support at gasserrashed454@gmail.com'
      },
      { status: 500 }
    )
  }
}
