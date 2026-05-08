'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sparkles, GraduationCap, Crown, Shield } from 'lucide-react'
import { AIAssistant } from './ai-assistant'
import type { Profile } from '@/lib/types'

interface AIAssistantWrapperProps {
  profile: Profile
}

const tierIcons = {
  free: Sparkles,
  student: GraduationCap,
  premium: Crown,
  enterprise: Shield,
}

const tierColors = {
  free: 'bg-primary hover:bg-primary/90',
  student: 'bg-green-600 hover:bg-green-700',
  premium: 'bg-amber-500 hover:bg-amber-600',
  enterprise: 'bg-blue-600 hover:bg-blue-700',
}

export function AIAssistantWrapper({ profile }: AIAssistantWrapperProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Initialize position on mount (bottom right corner)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPosition({ 
        x: window.innerWidth - 80, 
        y: window.innerHeight - 80 
      })
    }
  }, [])

  const handleMouseDown = (e: React.MouseEvent) => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
      setIsDragging(true)
    }
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const newX = Math.max(0, Math.min(window.innerWidth - 60, e.clientX - dragOffset.x))
      const newY = Math.max(0, Math.min(window.innerHeight - 60, e.clientY - dragOffset.y))
      setPosition({ x: newX, y: newY })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, dragOffset])

  const handleClick = () => {
    if (!isDragging) {
      setIsOpen(true)
    }
  }

  const TierIcon = tierIcons[profile.tier] || Sparkles

  return (
    <>
      {/* Floating Draggable AI Button */}
      {!isOpen && (
        <div 
          className="fixed z-50"
          style={{ 
            left: `${position.x}px`, 
            top: `${position.y}px`,
            cursor: isDragging ? 'grabbing' : 'grab'
          }}
        >
          <div className="relative group">
            <Button
              ref={buttonRef}
              onMouseDown={handleMouseDown}
              onClick={handleClick}
              className={`h-14 w-14 rounded-full shadow-lg ${tierColors[profile.tier]} transition-transform ${isDragging ? 'scale-110' : 'hover:scale-105'}`}
              size="icon"
            >
              <TierIcon className="h-6 w-6" />
            </Button>
            
            {/* Tier tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <Badge variant="secondary" className="whitespace-nowrap shadow-lg">
                <TierIcon className="h-3 w-3 mr-1" />
                {profile.tier.charAt(0).toUpperCase() + profile.tier.slice(1)} - {profile.ai_uses_today}/{profile.ai_daily_limit === 999999 ? '∞' : profile.ai_daily_limit} AI
              </Badge>
            </div>
            
            {/* Pulse animation for new users */}
            {profile.ai_uses_today === 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/75 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-primary"></span>
              </span>
            )}
          </div>
        </div>
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
