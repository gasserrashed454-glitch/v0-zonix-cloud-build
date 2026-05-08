'use client'

import { cn } from '@/lib/utils'

interface ZonixLogoProps {
  className?: string
  showText?: boolean
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const sizeMap = {
  sm: { icon: 24, text: 'text-lg' },
  md: { icon: 32, text: 'text-xl' },
  lg: { icon: 40, text: 'text-2xl' },
  xl: { icon: 56, text: 'text-3xl' },
}

export function ZonixLogo({ className, showText = true, size = 'md' }: ZonixLogoProps) {
  const { icon, text } = sizeMap[size]
  
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        {/* Professional cloud icon with clean lines */}
        <path
          d="M38 26C38 22.134 34.866 19 31 19C30.653 19 30.312 19.024 29.978 19.07C28.847 14.458 24.796 11 20 11C14.477 11 10 15.477 10 21C10 21.343 10.019 21.682 10.055 22.016C6.597 22.264 4 25.106 4 28.5C4 32.09 6.91 35 10.5 35H37.5C40.538 35 43 32.538 43 29.5C43 26.739 40.952 24.455 38.286 24.068C38.096 24.695 38 25.337 38 26Z"
          fill="url(#zonix-gradient)"
        />
        {/* Accent line for depth */}
        <path
          d="M14 28C14 28 18 24 24 24C30 24 34 28 34 28"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeOpacity="0.6"
        />
        <defs>
          <linearGradient id="zonix-gradient" x1="4" y1="11" x2="43" y2="35" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0078D4" />
            <stop offset="1" stopColor="#00A4EF" />
          </linearGradient>
        </defs>
      </svg>
      {showText && (
        <span className={cn('font-semibold text-foreground', text)}>
          Zonix<span className="text-primary">Cloud</span>
        </span>
      )}
    </div>
  )
}
