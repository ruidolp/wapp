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

  // Spring para la posición animada del index (el "carrusel")
  const [{ offset }, api] = useSpring(() => ({
    offset: initialIndex,
    config: { tension: 200, friction: 30 },
  }))

  // Cuando cambia el index, animar el offset
  useEffect(() => {
    api.start({ offset: index })
    onIndexChange?.(index)
  }, [index, api, onIndexChange])

  // Gesture handling con @use-gesture
  const bind = useDrag(
    ({ active, movement: [mx], direction: [xDir], distance: [dx], velocity: [vx], cancel }) => {
      if (active) {
        // Durante el arrastre: seguir el dedo
        const dragOffset = -mx / window.innerWidth
        api.start({ offset: index + dragOffset, immediate: true })
      } else {
        // Al soltar: verificar si se completó el swipe
        const trigger = Math.abs(dx) > 80 || (Math.abs(vx) > 0.3 && Math.abs(dx) > 30)

        if (trigger) {
          // Swipe completado: cambiar index
          const newIndex = index + (xDir > 0 ? -1 : 1)

          // Clamp index
          if (newIndex < 0 || newIndex >= items.length) {
            // Fuera de rango: spring back
            api.start({ offset: index, immediate: false })
          } else {
            // Cambiar al nuevo index (useEffect animará el offset)
            setIndex(newIndex)
          }
        } else {
          // Swipe no completado: spring back al index actual
          api.start({ offset: index, immediate: false })
        }
      }
    },
    {
      axis: 'x',
      filterTaps: true,
      pointer: { touch: true },
    }
  )

  // Renderizar 3 cards: anterior, actual, siguiente
  const cardsToRender = []
  const prevIndex = index - 1
  const nextIndex = index + 1

  if (prevIndex >= 0) {
    cardsToRender.push({ item: items[prevIndex], idx: prevIndex })
  }
  cardsToRender.push({ item: items[index], idx: index })
  if (nextIndex < items.length) {
    cardsToRender.push({ item: items[nextIndex], idx: nextIndex })
  }

  return (
    <div className="relative w-full h-full overflow-hidden">
      <div className="relative w-full h-full">
        <div {...bind()} className="relative w-full h-full" style={{ touchAction: 'pan-y' }}>
          {cardsToRender.map(({ item, idx }) => (
            <animated.div
              key={item.id}
              style={{
                transform: offset.to((o) => `translate3d(${(idx - o) * 100}%, 0, 0)`),
                willChange: 'transform',
              }}
              className="absolute inset-0 w-full h-full"
            >
              <div className="w-full h-full">{item.content}</div>
            </animated.div>
          ))}
        </div>
      </div>
    </div>
  )
}
