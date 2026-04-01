'use client'

import { useState, useRef, useEffect } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport, type UIMessage } from 'ai'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Sparkles, 
  Send, 
  X, 
  Minimize2, 
  Maximize2,
  Bot,
  User,
  Loader2,
  FileSearch,
  HardDrive,
  FolderTree
} from 'lucide-react'
import type { Profile } from '@/lib/types'

interface AIAssistantProps {
  profile: Profile | null
  isOpen: boolean
  onClose: () => void
}

function getUIMessageText(msg: UIMessage): string {
  if (!msg.parts || !Array.isArray(msg.parts)) return ''
  return msg.parts
    .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
    .map((p) => p.text)
    .join('')
}

export function AIAssistant({ profile, isOpen, onClose }: AIAssistantProps) {
  const [isMinimized, setIsMinimized] = useState(false)
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: '/api/ai/chat' }),
  })

  const isLoading = status === 'streaming' || status === 'submitted'

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    sendMessage({ text: input })
    setInput('')
  }

  const quickActions = [
    { label: 'Search files', icon: FileSearch, prompt: 'Help me find my files' },
    { label: 'Storage info', icon: HardDrive, prompt: 'How much storage am I using?' },
    { label: 'Organize files', icon: FolderTree, prompt: 'Help me organize my files' },
  ]

  if (!isOpen) return null

  return (
    <Card className={`fixed bottom-4 right-4 z-50 shadow-2xl border-2 transition-all duration-300 ${
      isMinimized ? 'w-72 h-14' : 'w-96 h-[500px]'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b bg-primary/5 rounded-t-lg">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <div>
            <span className="font-medium text-sm">Zonix AI</span>
            {profile && (
              <Badge variant="outline" className="ml-2 text-xs">
                {profile.ai_uses_today}/{profile.ai_daily_limit === 999999 ? '∞' : profile.ai_daily_limit}
              </Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7"
            onClick={onClose}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <ScrollArea ref={scrollRef} className="flex-1 h-[360px] p-4">
            {messages.length === 0 ? (
              <div className="space-y-4">
                <div className="text-center py-6">
                  <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm font-medium">How can I help you today?</p>
                  <p className="text-xs text-muted-foreground">
                    Ask me about your files, storage, or anything else
                  </p>
                </div>
                <div className="space-y-2">
                  {quickActions.map((action) => {
                    const Icon = action.icon
                    return (
                      <button
                        key={action.label}
                        onClick={() => {
                          sendMessage({ text: action.prompt })
                        }}
                        className="w-full flex items-center gap-3 p-3 text-sm text-left rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <Icon className="h-4 w-4 text-primary" />
                        {action.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => {
                  const text = getUIMessageText(message)
                  const isUser = message.role === 'user'
                  
                  // Render tool invocations
                  const toolParts = message.parts?.filter(p => p.type === 'tool-invocation') || []
                  
                  return (
                    <div key={message.id} className="space-y-2">
                      <div className={`flex gap-2 ${isUser ? 'justify-end' : ''}`}>
                        {!isUser && (
                          <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <Bot className="h-4 w-4 text-primary" />
                          </div>
                        )}
                        <div className={`max-w-[80%] rounded-lg p-3 text-sm ${
                          isUser 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted'
                        }`}>
                          {text}
                        </div>
                        {isUser && (
                          <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center shrink-0">
                            <User className="h-4 w-4 text-primary-foreground" />
                          </div>
                        )}
                      </div>
                      
                      {/* Tool invocations */}
                      {toolParts.map((part, idx) => {
                        if (part.type !== 'tool-invocation') return null
                        const toolInvocation = part
                        return (
                          <div key={idx} className="ml-9">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              {toolInvocation.state === 'output-available' ? (
                                <Badge variant="secondary" className="text-xs">
                                  <FileSearch className="h-3 w-3 mr-1" />
                                  {toolInvocation.toolName}
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-xs">
                                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                  {toolInvocation.toolName}
                                </Badge>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )
                })}
                {isLoading && (
                  <div className="flex gap-2">
                    <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                    <div className="bg-muted rounded-lg p-3">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {error && (
              <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-lg">
                {error.message || 'An error occurred'}
              </div>
            )}
          </ScrollArea>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-3 border-t">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </>
      )}
    </Card>
  )
}
