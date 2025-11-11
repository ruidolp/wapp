'use client'

import { ReactNode, useCallback, useEffect } from 'react'
import useEmblaCarousel from 'embla-carousel-react'

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
  // Embla Carousel setup with iOS-like smooth physics
  const [emblaRef, emblaApi] = useEmblaCarousel({
    startIndex: initialIndex,
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: false, // Snap to slides for precise navigation
    skipSnaps: false,
    loop: false,
    // Physics configuration for smooth iOS-like feel
    duration: 25, // Smooth transition duration
    dragThreshold: 10, // Lower threshold for responsive drag
  })

  // Listen for slide changes and notify parent
  const onSelect = useCallback(() => {
    if (!emblaApi) return
    const selectedIndex = emblaApi.selectedScrollSnap()
    onIndexChange?.(selectedIndex)
  }, [emblaApi, onIndexChange])

  // Setup event listener
  useEffect(() => {
    if (!emblaApi) return

    // Initial call
    onSelect()

    // Listen to slide changes
    emblaApi.on('select', onSelect)

    // Cleanup
    return () => {
      emblaApi.off('select', onSelect)
    }
  }, [emblaApi, onSelect])

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Embla viewport */}
      <div ref={emblaRef} className="w-full h-full overflow-hidden">
        {/* Embla container */}
        <div className="flex h-full touch-pan-y">
          {/* Slides */}
          {items.map((item) => (
            <div
              key={item.id}
              className="flex-[0_0_100%] min-w-0 h-full"
              style={{
                // Hardware acceleration for smooth performance
                transform: 'translate3d(0, 0, 0)',
                willChange: 'transform',
              }}
            >
              <div className="w-full h-full">
                {item.content}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
