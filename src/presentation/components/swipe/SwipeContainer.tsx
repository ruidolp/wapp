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
      }
    } else if (diff === -1) {
      // Previous card - smaller, to the left, semi-transparent
      return {
        transform: 'scale(0.85) translateX(-85%)',
        opacity: 0.4,
        zIndex: 5,
      }
    } else if (diff === 1) {
      // Next card - smaller, to the right, semi-transparent
      return {
        transform: 'scale(0.85) translateX(85%)',
        opacity: 0.4,
        zIndex: 5,
      }
    } else {
      // Hidden cards
      return {
        transform: diff < 0 ? 'scale(0.7) translateX(-200%)' : 'scale(0.7) translateX(200%)',
        opacity: 0,
        zIndex: 0,
      }
    }
  }

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Cards Container */}
      <div
        className="relative w-full h-[calc(100%-4rem)] flex items-center justify-center"
        {...swipeHandlers}
      >
        {items.map((item, index) => {
          const style = getCardStyle(index)
          const isActive = index === activeIndex
          const isAdjacent = Math.abs(index - activeIndex) === 1

          return (
            <div
              key={item.id}
              className="absolute inset-0 flex flex-col items-center justify-center transition-all duration-300 ease-out"
              style={{
                transform: style.transform,
                opacity: style.opacity,
                zIndex: style.zIndex,
              }}
              onClick={() => {
                if (!isActive && isAdjacent) {
                  goToIndex(index)
                }
              }}
            >
              {/* Card Name Label (for adjacent cards) */}
              {isAdjacent && (
                <div className="absolute top-4 left-0 right-0 text-center z-20">
                  <span className="text-sm font-medium text-gray-500 bg-white/80 px-3 py-1 rounded-full">
                    {item.name}
                  </span>
                </div>
              )}

              {/* Card Content */}
              <div className="w-full h-full">
                {item.content}
              </div>
            </div>
          )
        })}
      </div>

      {/* Dots Navigation */}
      <div className="absolute bottom-0 left-0 right-0 h-16 flex items-center justify-center gap-2">
        {items.map((item, index) => (
          <button
            key={item.id}
            onClick={() => goToIndex(index)}
            className={`transition-all duration-200 rounded-full ${
              index === activeIndex
                ? 'w-8 h-2 bg-primary'
                : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'
            }`}
            aria-label={`Go to ${item.name}`}
          />
        ))}
      </div>
    </div>
  )
}
