'use client'

import { ReactNode, useState, useEffect } from 'react'
import { useSpring, animated, config } from '@react-spring/web'
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

  // Spring animation for card position
  const [{ x }, api] = useSpring(() => ({
    x: 0,
    config: config.stiff,
  }))

  // Notify parent of index changes
  useEffect(() => {
    onIndexChange?.(index)
  }, [index, onIndexChange])

  // Gesture handling with @use-gesture
  const bind = useDrag(
    ({ active, movement: [mx], direction: [xDir], distance, cancel, velocity: [vx] }) => {
      // Swipe threshold: 50px or fast swipe (velocity > 0.2)
      const trigger = distance > 50 || (vx > 0.2 && distance > 20)

      if (trigger && !active) {
        // Determine direction
        const newIndex = index + (xDir > 0 ? -1 : 1)

        // Clamp index
        if (newIndex < 0 || newIndex >= items.length) {
          cancel()
          api.start({ x: 0, immediate: false })
          return
        }

        setIndex(newIndex)
        api.start({ x: 0, immediate: false })
      } else {
        // Follow finger or spring back
        api.start({
          x: active ? mx : 0,
          immediate: active,
        })
      }
    },
    {
      axis: 'x',
      filterTaps: true,
      pointer: { touch: true },
    }
  )

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Main swipe container with padding for fixed footer */}
      <div className="relative w-full h-full pb-24">
        <animated.div
          {...bind()}
          style={{
            x,
            touchAction: 'pan-y',
            willChange: 'transform',
          }}
          className="relative w-full h-full"
        >
          {/* Only render active card for performance */}
          <div className="absolute inset-0 flex items-start justify-center">
            <div className="w-full max-w-2xl h-full px-2">
              {items[index]?.content}
            </div>
          </div>
        </animated.div>
      </div>
    </div>
  )
}
