'use client'

import { ReactNode, useState, useRef } from 'react'
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
  const containerRef = useRef<HTMLDivElement | null>(null)

  // offset = desplazamiento relativo en páginas respecto al índice actual
  const [{ offset }, api] = useSpring(() => ({
    offset: 0,
    config: { tension: 220, friction: 26 },
  }))

  const clampIndex = (i: number) =>
    Math.max(0, Math.min(items.length - 1, i))

  const goTo = (nextIndex: number, dir: number) => {
    api.start({
      offset: dir, // animamos hasta completar la página
      onRest: () => {
        const final = clampIndex(nextIndex)
        if (final !== index) {
          setIndex(final)
          onIndexChange?.(final)
        }
        // centramos el nuevo slide sin salto
        api.set({ offset: 0 })
      },
    })
  }

  const bind = useDrag(
    ({ active, movement: [mx], direction: [dx], velocity: [vx], last }) => {
      if (items.length <= 1) return

      const width =
        containerRef.current?.offsetWidth ||
        (typeof window !== 'undefined' ? window.innerWidth : 1)

      const delta = mx / width
      const isSwipe =
        Math.abs(delta) > 0.25 || (vx > 0.25 && Math.abs(delta) > 0.1)

      if (active && !last) {
        // rubber-band en bordes, pero working sobre delta relativo
        let displayed = delta
        const atFirst = index === 0 && delta > 0
        const atLast = index === items.length - 1 && delta < 0

        if (atFirst || atLast) {
          displayed = delta * 0.3
        }

        api.start({ offset: displayed, immediate: true })
        return
      }

      if (!active && last) {
        if (!isSwipe) {
          // volver al centro
          api.start({ offset: 0 })
          return
        }

        // dx: -1 = hacia la izquierda (siguiente), 1 = hacia la derecha (anterior)
        const dir = dx < 0 ? 1 : -1
        const targetIndex = clampIndex(index + dir)

        if (targetIndex === index) {
          // en borde, solo snap back
          api.start({ offset: 0 })
        } else {
          goTo(targetIndex, dir)
        }
      }
    },
    {
      axis: 'x',
      filterTaps: true,
      pointer: { touch: true },
    }
  )

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden"
    >
      <div
        {...bind()}
        className="relative w-full h-full"
        style={{ touchAction: 'pan-y' }}
      >
        {items.map((item, i) => (
          <animated.div
            key={item.id}
            className="absolute inset-0 w-full h-full"
            style={{
              willChange: 'transform',
              transform: offset.to(
                (o) => `translate3d(${(i - index - o) * 100}%, 0, 0)`
              ),
            }}
          >
            <div className="w-full h-full">
              {item.content}
            </div>
          </animated.div>
        ))}
      </div>
    </div>
  )
}
