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
    <div className="relative w-full px-4 py-3 bg-gradient-to-b from-white/95 via-white/90 to-transparent backdrop-blur-md border-b border-slate-200/50"
      style={{
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
      }}
    >
      <div className="flex items-center justify-between">
        {/* Botón de Perfil - Izquierda */}
        <button
          onClick={onProfileClick}
          className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-105"
          style={{
            boxShadow: '0 6px 20px rgba(147, 51, 234, 0.3)',
          }}
          aria-label="Abrir perfil"
        >
          <User className="w-6 h-6 text-white" />
        </button>

        {/* Indicadores de Swipe (Dots) - Centro */}
        <div className="flex items-center justify-center gap-2">
          {items.map((_, index) => (
            <div
              key={index}
              className={`transition-all duration-300 rounded-full ${
                index === activeIndex
                  ? 'w-8 h-2.5 bg-gradient-to-r from-blue-500 to-purple-500'
                  : 'w-2.5 h-2.5 bg-slate-300 hover:bg-slate-400'
              }`}
              style={
                index === activeIndex
                  ? { boxShadow: '0 2px 8px rgba(147, 51, 234, 0.4)' }
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
