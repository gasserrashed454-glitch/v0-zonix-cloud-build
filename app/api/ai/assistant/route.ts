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

    const systemPrompt = `You are Zonix AI Assistant, a helpful and friendly AI powered by Google Gemini. You help users with questions about Zonix Cloud storage service.

IMPORTANT CONTEXT - Zonix Cloud Information:
${context}

Guidelines:
- Be helpful, concise, and friendly
- Answer questions about pricing, features, storage limits, and tiers accurately based on the context provided
- If asked about something not in the context, politely say you can help with Zonix Cloud questions
- Recommend appropriate tiers based on user needs
- Always mention the support email (gasserrashed454@gmail.com) if users have complex issues
- Keep responses brief but informative
- Use bullet points for listing features
- Be encouraging about the Student tier for eligible users`

    console.log('[v0] Calling Gemini API with', conversationHistory.length + 1, 'messages')

    const result = await generateText({
      model: 'google/gemini-1.5-flash',
      system: systemPrompt,
      messages: [
        ...conversationHistory,
        { role: 'user' as const, content: message }
      ],
      maxOutputTokens: 500,
    })

    console.log('[v0] Gemini response received:', result.text.substring(0, 50) + '...')

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
