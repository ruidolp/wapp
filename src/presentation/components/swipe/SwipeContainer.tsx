'use client'

import { ReactNode } from 'react'
import { useCarousel } from '@/presentation/hooks/useSwipe'

export interface SwipeItem {
  id: string
  name: string
  color?: string
  content: ReactNode
}

interface SwipeContainerProps {
  items: SwipeItem[]
  initialIndex?: number
  onIndexChange?: (index: number) => void
}

export function SwipeContainer({
  items,
  initialIndex = 0,
  onIndexChange,
}: SwipeContainerProps) {
  const { activeIndex, swipeHandlers, goToIndex } = useCarousel({
    itemCount: items.length,
    initialIndex,
    onIndexChange,
  })

  const getCardStyle = (index: number) => {
    const diff = index - activeIndex

    if (diff === 0) {
      // Active card - full size, centered, full opacity
      return {
        transform: 'scale(1) translateX(0)',
        opacity: 1,
        zIndex: 10,
        pointerEvents: 'auto' as const,
      }
    } else if (diff === -1) {
      // Previous card - smaller, to the left, semi-transparent
      return {
        transform: 'scale(0.9) translateX(-100%)',
        opacity: 0.3,
        zIndex: 5,
        pointerEvents: 'none' as const,
      }
    } else if (diff === 1) {
      // Next card - smaller, to the right, semi-transparent
      return {
        transform: 'scale(0.9) translateX(100%)',
        opacity: 0.3,
        zIndex: 5,
        pointerEvents: 'none' as const,
      }
    } else {
      // Hidden cards
      return {
        transform: diff < 0 ? 'scale(0.7) translateX(-200%)' : 'scale(0.7) translateX(200%)',
        opacity: 0,
        zIndex: 0,
        pointerEvents: 'none' as const,
      }
    }
  }

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Cards Container - Con padding bottom para el footer fixed */}
      <div
        className="relative w-full h-full flex items-start justify-center pb-24"
        {...swipeHandlers}
        style={{
          touchAction: 'pan-y pinch-zoom',
        }}
      >
        {items.map((item, index) => {
          const style = getCardStyle(index)

          return (
            <div
              key={item.id}
              className="absolute inset-0 flex flex-col transition-all duration-300 ease-out"
              style={{
                transform: style.transform,
                opacity: style.opacity,
                zIndex: style.zIndex,
                pointerEvents: style.pointerEvents,
              }}
            >
              {/* Card Content */}
              <div className="w-full h-full overflow-y-auto">
                {item.content}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
