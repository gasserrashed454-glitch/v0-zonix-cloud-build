import { streamText, tool, convertToModelMessages } from 'ai'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return new Response('Unauthorized', { status: 401 })
    }

    // Fetch user profile first
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return new Response(JSON.stringify({ error: 'Profile not found' }), { status: 401 })
    }

    // Check AI usage limits based on tier
    if (profile.tier === 'student' && profile.ai_uses_today >= 200) {
      return new Response(JSON.stringify({ 
        error: 'Daily student AI limit (200) reached. Try again tomorrow.' 
      }), { 
        status: 429,
        headers: { 'Content-Type': 'application/json' }
      })
    } else if (profile.tier === 'free' && profile.ai_uses_today >= 50) {
      return new Response(JSON.stringify({ 
        error: 'Daily AI limit (50) reached. Upgrade to Student or Premium for more usage.' 
      }), { 
        status: 429,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    // Premium and Enterprise have unlimited

    const { messages, context } = await req.json()

    // Increment AI usage
    await supabase
      .from('profiles')
      .update({ ai_uses_today: profile.ai_uses_today + 1 })
      .eq('id', user.id)

    // Define AI tools based on user tier
    const tools: Record<string, ReturnType<typeof tool>> = {
      searchFiles: tool({
        description: 'Search through user files by name or content type',
        inputSchema: z.object({
          query: z.string().describe('Search query'),
          type: z.string().optional().describe('File type filter'),
        }),
        execute: async ({ query, type }) => {
          let searchQuery = supabase
            .from('files')
            .select('id, name, mime_type, size, created_at')
            .eq('user_id', user.id)
            .eq('is_trashed', false)
            .ilike('name', `%${query}%`)

          if (type) {
            searchQuery = searchQuery.ilike('mime_type', `%${type}%`)
          }

          const { data: files } = await searchQuery.limit(10)
          return { files: files || [], count: files?.length || 0 }
        },
      }),
      getFileInfo: tool({
        description: 'Get detailed information about a specific file',
        inputSchema: z.object({
          fileId: z.string().describe('The file ID'),
        }),
        execute: async ({ fileId }) => {
          const { data: file } = await supabase
            .from('files')
            .select('*')
            .eq('id', fileId)
            .eq('user_id', user.id)
            .single()
          return file || { error: 'File not found' }
        },
      }),
      getStorageInfo: tool({
        description: 'Get user storage usage information',
        inputSchema: z.object({}),
        execute: async () => {
          const { data } = await supabase
            .from('profiles')
            .select('storage_used, storage_limit, tier')
            .eq('id', user.id)
            .single()
          
          if (!data) return { error: 'Could not retrieve storage info' }
          
          return {
            used: data.storage_used,
            limit: data.storage_limit,
            usedFormatted: formatBytes(data.storage_used),
            limitFormatted: formatBytes(data.storage_limit),
            percentUsed: ((data.storage_used / data.storage_limit) * 100).toFixed(1),
            tier: data.tier,
          }
        },
      }),
    }

    // Add premium tools
    if (['premium', 'enterprise', 'student'].includes(profile.tier)) {
      tools.organizeFiles = tool({
        description: 'Suggest file organization based on file types and names',
        inputSchema: z.object({
          analyze: z.boolean().describe('Whether to analyze current organization'),
        }),
        execute: async () => {
          const { data: files } = await supabase
            .from('files')
            .select('name, mime_type, folder_id')
            .eq('user_id', user.id)
            .eq('is_trashed', false)
            .is('folder_id', null)
            .limit(50)

          const suggestions = []
          const filesByType: Record<string, number> = {}

          for (const file of files || []) {
            const type = file.mime_type?.split('/')[0] || 'other'
            filesByType[type] = (filesByType[type] || 0) + 1
          }

          for (const [type, count] of Object.entries(filesByType)) {
            if (count >= 3) {
              suggestions.push(`Create a "${type}s" folder for your ${count} ${type} files`)
            }
          }

          return { 
            unorganizedFiles: files?.length || 0,
            filesByType,
            suggestions: suggestions.length > 0 ? suggestions : ['Your files appear well organized!']
          }
        },
      })
    }

    const systemPrompt = `You are Zonix AI, a helpful assistant for Zonix Cloud file storage service powered by Groq (free & fast). 
You help users manage their files, search for documents, and provide insights about their storage.

User context:
- Tier: ${profile.tier}
- Storage Used: ${formatBytes(profile.storage_used || 0)} / ${formatBytes(profile.storage_limit || 0)}
- AI Daily Limit: ${profile.tier === 'student' ? '200' : profile.tier === 'free' ? '50' : 'Unlimited'} uses
${context ? `\nAdditional context: ${JSON.stringify(context)}` : ''}

You are powered by Groq's fast, open-source AI models - completely free with no usage limits for Premium tier.
Be concise, helpful, and friendly. When users ask about files, use the available tools to search and provide accurate information.`

    const result = streamText({
      model: 'groq/mixtral-8x7b-32768',
      system: systemPrompt,
      messages: await convertToModelMessages(messages),
      tools,
      maxSteps: 5,
    })

    return result.toUIMessageStreamResponse()
  } catch (error) {
    console.error('AI Chat error:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
