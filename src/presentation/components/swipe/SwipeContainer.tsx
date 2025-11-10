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

  const goTo = (fromIndex: number, toIndex: number) => {
    const final = clampIndex(toIndex)
    if (final === fromIndex) {
      // Nada que hacer, solo snap back
      api.start({ offset: 0 })
      return
    }

    // Si vamos hacia adelante (index+1), contenido se desplaza a la izquierda => offsetDir = -1
    // Si vamos hacia atrás (index-1), contenido se desplaza a la derecha => offsetDir = +1
    const offsetDir = final > fromIndex ? -1 : 1

    api.start({
      offset: offsetDir,
      onRest: () => {
        // Reseteamos primero el offset a 0 de forma inmediata
        api.set({ offset: 0, immediate: true })

        // Luego actualizamos el índice lógico
        setIndex(final)
        onIndexChange?.(final)
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
        let displayed = delta

        // Rubber-band en bordes
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

        // dx: -1 = dedo hacia la izquierda → vamos a siguiente (index + 1)
        // dx:  1 = dedo hacia la derecha → vamos a anterior (index - 1)
        const toIndex =
          dx < 0 ? index + 1 : index - 1

        goTo(index, toIndex)
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

