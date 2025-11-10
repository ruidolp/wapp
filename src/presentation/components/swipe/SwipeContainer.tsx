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

  // offset = desplazamiento relativo respecto al índice actual:
  // 0 = centrado, -1 = siguiente (contenido se fue a la izquierda), +1 = anterior.
  const [{ offset }, api] = useSpring(() => ({
    offset: 0,
    config: { tension: 220, friction: 26 },
  }))

  const clampIndex = (i: number) =>
    Math.max(0, Math.min(items.length - 1, i))

  const goTo = (fromIndex: number, toIndex: number) => {
    const final = clampIndex(toIndex)
    if (final === fromIndex) {
      // Nada que mover, solo recentrar
      api.start({ offset: 0 })
      return
    }

    // final > fromIndex => vamos a la siguiente ⇒ contenido se desplaza a la izquierda ⇒ offsetDir = -1
    // final < fromIndex => vamos a la anterior ⇒ contenido se desplaza a la derecha ⇒ offsetDir = +1
    const offsetDir = final > fromIndex ? -1 : 1

    api.start({
      offset: offsetDir,
      onRest: () => {
        // 1) Dejamos el offset nuevamente en 0 (centrado relativo)
        api.set({ offset: 0 })
        // 2) Actualizamos index lógico al nuevo slide
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
          // No alcanzó el umbral → volver suave al centro
          api.start({ offset: 0 })
          return
        }

        // dx: -1 = dedo hacia la izquierda → ir a siguiente (index + 1)
        // dx:  1 = dedo hacia la derecha → ir a anterior (index - 1)
        const toIndex = dx < 0 ? index + 1 : index - 1
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
            <div className="w-full h-full">{item.content}</div>
          </animated.div>
        ))}
      </div>
    </div>
  )
}

