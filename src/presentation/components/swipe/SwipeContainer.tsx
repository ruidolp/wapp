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

  // Spring animation for card position - smooth transitions
  const [{ x }, api] = useSpring(() => ({
    x: 0,
    config: { tension: 280, friction: 35 }, // Smooth and fluid
  }))

  // Notify parent of index changes
  useEffect(() => {
    onIndexChange?.(index)
  }, [index, onIndexChange])

  // Gesture handling with @use-gesture
  const bind = useDrag(
    ({ active, movement: [mx], direction: [xDir], distance: [dx], cancel, velocity: [vx] }) => {
      // Swipe threshold: 80px or fast swipe (velocity > 0.3)
      const trigger = Math.abs(dx) > 80 || (Math.abs(vx) > 0.3 && Math.abs(dx) > 30)

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

  // Determinar qué cards renderizar (anterior, actual, siguiente)
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
    <div className="relative w-full h-full overflow-hidden">
      {/* Main swipe container */}
      <div className="relative w-full h-full">
        <animated.div
          {...bind()}
          style={{
            touchAction: 'pan-y',
          }}
          className="relative w-full h-full"
        >
          {/* Renderizar las 3 cards (anterior, actual, siguiente) */}
          {cardsToRender.map(({ item, position, key }) => (
            <animated.div
              key={key}
              style={{
                transform: x.to((xVal) => {
                  // Posición base + desplazamiento del gesto
                  const basePosition = position * 100
                  const offset = (xVal / window.innerWidth) * 100
                  return `translate3d(${basePosition + offset}%, 0, 0)`
                }),
                willChange: 'transform',
              }}
              className="absolute inset-0 w-full h-full"
            >
              <div className="w-full h-full">
                {item.content}
              </div>
            </animated.div>
          ))}
        </animated.div>
      </div>
    </div>
  )
}
