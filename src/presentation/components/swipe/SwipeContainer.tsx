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
  const indexRef = useRef(initialIndex)
  const startIndexRef = useRef(initialIndex)
  const containerRef = useRef<HTMLDivElement | null>(null)

  const [{ page }, api] = useSpring(() => ({
    page: initialIndex,
    config: { tension: 220, friction: 26 },
  }))

  const clampIndex = (i: number) =>
    Math.max(0, Math.min(items.length - 1, i))

  // Mantener ref sincronizado si index cambia externamente
  useEffect(() => {
    indexRef.current = initialIndex
    setIndex(initialIndex)
    api.start({ page: initialIndex })
  }, [initialIndex, api])

  const bind = useDrag(
    ({
      first,
      active,
      last,
      movement: [mx],
      velocity: [vx],
      direction: [dx],
    }) => {
      if (items.length <= 1) return

      const width =
        containerRef.current?.offsetWidth ||
        (typeof window !== 'undefined' ? window.innerWidth : 1)

      if (first) {
        // Fijamos desde qué página partimos ESTE gesto
        startIndexRef.current = indexRef.current
      }

      const startIndex = startIndexRef.current
      const delta = mx / width

      if (active && !last) {
        // Mientras arrastro: mover proporcional desde startIndex
        let nextPage = startIndex - delta

        // Rubber-band suave en bordes
        if (nextPage < 0) {
          nextPage = -Math.pow(-nextPage, 0.6)
        } else if (nextPage > items.length - 1) {
          const extra = nextPage - (items.length - 1)
          nextPage = (items.length - 1) + Math.pow(extra, 0.6)
        }

        api.start({ page: nextPage, immediate: true })
        return
      }

      if (last) {
        const currentPage = page.get() as number

        // Heurística simple y estable
        const isSwipe = Math.abs(delta) > 0.25 || vx > 0.3

        let targetIndex = clampIndex(Math.round(currentPage))

        if (isSwipe) {
          // Forzar al menos un paso en la dirección del gesto
          if (dx < 0) {
            // dedo hacia la izquierda → siguiente
            targetIndex = clampIndex(startIndex + 1)
          } else if (dx > 0) {
            // dedo hacia la derecha → anterior
            targetIndex = clampIndex(startIndex - 1)
          }
        }

        api.start({
          page: targetIndex,
          onRest: () => {
            // Actualizar solo si realmente cambió
            if (targetIndex !== indexRef.current) {
              indexRef.current = targetIndex
              setIndex(targetIndex)
              onIndexChange?.(targetIndex)
            }
          },
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
              transform: page.to(
                (p) => `translate3d(${(i - p) * 100}%, 0, 0)`
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

