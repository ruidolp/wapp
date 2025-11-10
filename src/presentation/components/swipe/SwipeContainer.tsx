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
  const containerRef = useRef<HTMLDivElement>(null)

  // offset = desplazamiento relativo en "páginas" respecto al index actual.
  // 0 = centrado, -1 = una página a la derecha, +1 = una página a la izquierda.
  const [{ offset }, api] = useSpring(() => ({
    offset: 0,
    config: { tension: 220, friction: 26 },
  }))

  const clampIndex = (i: number) => Math.max(0, Math.min(items.length - 1, i))

  const bind = useDrag(
    ({
      active,
      movement: [mx],
      direction: [xDir],
      velocity: [vx],
      last,
    }) => {
      if (items.length <= 1) return

      const width = containerRef.current?.offsetWidth || window.innerWidth

      const delta = mx / width // desplazamiento en "páginas"
      const isSwipe =
        Math.abs(delta) > 0.25 || (Math.abs(vx) > 0.25 && Math.abs(delta) > 0.1)

      if (active && !last) {
        // Seguir el dedo, pero con un pequeño límite para no arrastrar infinito en los bordes
        const atFirst = index === 0 && delta > 0
        const atLast = index === items.length - 1 && delta < 0
        const resistance = atFirst || atLast ? 0.3 : 1
        api.start({ offset: delta * resistance, immediate: true })
        return
      }

      // Al soltar:
      if (!active && last) {
        if (isSwipe) {
          const dir = xDir < 0 ? 1 : -1 // -x = siguiente, +x = anterior
          const targetIndex = clampIndex(index + dir)

          if (targetIndex === index) {
            // En borde: volver suave
            api.start({ offset: 0 })
            return
          }

          // Animar hasta la página completa
          api.start({
            offset: dir,
            onRest: () => {
              const finalIndex = clampIndex(index + dir)
              setIndex(finalIndex)
              onIndexChange?.(finalIndex)
              // Reseteamos offset instantáneo para que el nuevo index quede centrado sin salto
              api.set({ offset: 0 })
            },
          })
        } else {
          // No alcanzó el umbral: volver al centro
          api.start({ offset: 0 })
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
    <div ref={containerRef} className="relative w-full h-full overflow-hidden">
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
            <div className="w-full h-full">{item.content}</div>
          </animated.div>
        ))}
      </div>
    </div>
  )
}
