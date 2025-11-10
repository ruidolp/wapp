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

  // offset = desplazamiento relativo en "páginas" respecto al índice actual.
  // 0 = centrado, -1 = siguiente a la derecha, +1 = anterior a la izquierda.
  const [{ offset }, api] = useSpring(() => ({
    offset: 0,
    config: { tension: 220, friction: 26 },
  }))

  const clampIndex = (i: number) =>
    Math.max(0, Math.min(items.length - 1, i))

  const goTo = (finalIndex: number, offsetDir: number) => {
    api.start({
      offset: offsetDir,
      onRest: () => {
        setIndex(finalIndex)
        onIndexChange?.(finalIndex)
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
        // Desplazamiento relativo siguiendo el dedo
        let displayed = delta

        // Rubber-band suave en bordes
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
          // No alcanzó umbral → volver al centro
          api.start({ offset: 0 })
          return
        }

        // dx: -1 = dedo hacia la izquierda → queremos ir a la siguiente (index + 1)
        // dx:  1 = dedo hacia la derecha → ir a la anterior (index - 1)
        const slideDelta = dx < 0 ? 1 : -1
        const finalIndex = clampIndex(index + slideDelta)

        if (finalIndex === index) {
          // En borde, solo snap back
          api.start({ offset: 0 })
          return
        }

        // Dirección de la animación del offset:
        // si vamos a la siguiente (slideDelta = 1), contenido se termina yendo a la izquierda → offsetDir = -1
        // si vamos a la anterior (slideDelta = -1), contenido se termina yendo a la derecha → offsetDir = +1
        const offsetDir = slideDelta === 1 ? -1 : 1

        goTo(finalIndex, offsetDir)
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
                (o) => `translate3d(${(i - index + o) * 100}%, 0, 0)`
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

