'use client'

import { User } from 'lucide-react'
import { ThemeSelector } from '@/components/theme/theme-selector'

interface SwipeHeaderProps {
  items: {
    id: string
    name: string
  }[]
  activeIndex: number
  onProfileClick?: () => void
}

export function SwipeHeader({ items, activeIndex, onProfileClick }: SwipeHeaderProps) {
  return (
    <div className="relative w-full px-4 py-2 bg-gradient-to-b from-background/95 via-background/90 to-transparent backdrop-blur-md border-b border-border"
      style={{
        boxShadow: '0 4px 20px hsl(var(--primary) / 0.06)',
      }}
    >
      <div className="flex items-center justify-between">
        {/* Botón de Perfil - Izquierda */}
        <button
          onClick={onProfileClick}
          className="w-10 h-10 rounded-full bg-gradient-to-br from-[hsl(var(--primary))] via-[hsl(var(--accent))] to-[hsl(var(--secondary))] flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-105"
          style={{
            boxShadow: '0 6px 20px hsl(var(--primary) / 0.3)',
          }}
          aria-label="Abrir perfil"
        >
          <User className="w-5 h-5 text-primary-foreground" />
        </button>

        {/* Indicadores de Swipe (Dots) - Centro */}
        <div className="flex items-center justify-center gap-2">
          {items.map((_, index) => (
            <div
              key={index}
              className={`transition-all duration-300 rounded-full ${
                index === activeIndex
                  ? 'w-8 h-2.5 bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))]'
                  : 'w-2.5 h-2.5 bg-muted hover:bg-muted-foreground/30'
              }`}
              style={
                index === activeIndex
                  ? { boxShadow: '0 2px 8px hsl(var(--primary) / 0.4)' }
                  : undefined
              }
            />
          ))}
        </div>

        {/* Theme Selector - Derecha */}
        <div className="flex items-center">
          <ThemeSelector />
        </div>
      </div>
    </div>
  )
}
