'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sparkles } from 'lucide-react'
import { AIAssistant } from './ai-assistant'
import type { Profile } from '@/lib/types'

interface AIAssistantWrapperProps {
  profile: Profile
}

export function AIAssistantWrapper({ profile }: AIAssistantWrapperProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Floating AI Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg"
          size="icon"
        >
          <Sparkles className="h-6 w-6" />
        </Button>
      )}

      {/* AI Assistant Panel */}
      <AIAssistant 
        profile={profile} 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
      />
    </>
  )
}
