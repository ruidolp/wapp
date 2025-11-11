'use client'

import { ReactNode, useState, useRef, useEffect } from 'react'
import { useSpring, animated } from '@react-spring/web'
import { useDrag } from '@use-gesture/react'

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
  const [index, setIndex] = useState(initialIndex)
  const containerRef = useRef<HTMLDivElement>(null)

  // Spring animation for position - CRITICAL: uses immediate during drag
  const [{ x }, api] = useSpring(() => ({
    x: 0,
    config: { tension: 280, friction: 35 },
  }))

  // Notify parent of index changes
  useEffect(() => {
    onIndexChange?.(index)
  }, [index, onIndexChange])

  // Gesture handling - USES MEMO TO PREVENT RACE CONDITIONS
  const bind = useDrag(
    ({ active, movement: [mx], direction: [xDir], distance, velocity: [vx], memo }) => {
      // memo stores the index when drag started - prevents jumps
      const dragStartIndex = memo ?? index

      if (active) {
        // During drag: move cards following finger
        // CRITICAL: Use immediate mode to prevent animation lag
        api.start({ x: mx, immediate: true })

        // Return the starting index to persist across drag events
        return dragStartIndex
      }

      // Drag ended - determine if we should change page
      const width = containerRef.current?.offsetWidth || window.innerWidth
      const threshold = 50 // px
      const velocityThreshold = 0.2

      // Calculate target index based on swipe distance and velocity
      let targetIndex = dragStartIndex

      if (Math.abs(mx) > threshold || Math.abs(vx) > velocityThreshold) {
        // Swipe detected
        if (mx > 0) {
          // Swiped right - go to previous
          targetIndex = Math.max(0, dragStartIndex - 1)
        } else {
          // Swiped left - go to next
          targetIndex = Math.min(items.length - 1, dragStartIndex + 1)
        }
      }

      // Animate back to center
      api.start({
        x: 0,
        immediate: false,
        onRest: () => {
          // CRITICAL: Update index only after animation completes
          if (targetIndex !== index) {
            setIndex(targetIndex)
          }
        }
      })

      // Don't return anything - memo is not needed after drag ends
    },
    {
      axis: 'x',
      filterTaps: true,
      pointer: { touch: true },
    }
  )

  // Calculate which cards to render (prev, current, next)
  const cardsToRender = []
  const prevIndex = index - 1
  const nextIndex = index + 1

  if (prevIndex >= 0) {
    cardsToRender.push({ item: items[prevIndex], position: -1, key: items[prevIndex].id })
  }
  cardsToRender.push({ item: items[index], position: 0, key: items[index].id })
  if (nextIndex < items.length) {
    cardsToRender.push({ item: items[nextIndex], position: 1, key: items[nextIndex].id })
  }

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden">
      <div className="relative w-full h-full">
        {/* CRITICAL: touchAction on draggable element prevents browser scroll conflicts */}
        <div
          {...bind()}
          style={{ touchAction: 'pan-y pinch-zoom' }}
          className="relative w-full h-full cursor-grab active:cursor-grabbing"
        >
          {/* Render 3 cards: previous, current, next */}
          {cardsToRender.map(({ item, position, key }) => (
            <animated.div
              key={key}
              style={{
                transform: x.to((xVal) => {
                  // CRITICAL: Get width from ref, not window
                  const width = containerRef.current?.offsetWidth || window.innerWidth
                  const basePosition = position * 100
                  const offset = (xVal / width) * 100
                  return `translate3d(${basePosition + offset}%, 0, 0)`
                }),
                willChange: 'transform',
              }}
              className="absolute inset-0 w-full h-full"
            >
              <div className="w-full h-full pointer-events-none">
                {item.content}
              </div>
            </animated.div>
          ))}
        </div>
      </div>
    </div>
  )
}
