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
  const containerRef = useRef<HTMLDivElement | null>(null)

  // page = índice "visual" continuo (0, 0.2, 0.8, 1, etc.)
  const [{ page }, api] = useSpring(() => ({
    page: initialIndex,
    config: { tension: 220, friction: 26 },
  }))

  // Si cambian el initialIndex desde afuera, sincronizamos
  useEffect(() => {
    setIndex(initialIndex)
    api.start({ page: initialIndex })
  }, [initialIndex, api])

  const clampIndex = (i: number) =>
    Math.max(0, Math.min(items.length - 1, i))

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
        // Mientras arrastro: muevo la "page" continua
        const rawPage = index - delta

        // Rubber-band suave en bordes
        let nextPage = rawPage
        if (rawPage < 0) {
          nextPage = -Math.pow(-rawPage, 0.6)
        } else if (rawPage > items.length - 1) {
          const extra = rawPage - (items.length - 1)
          nextPage = (items.length - 1) + Math.pow(extra, 0.6)
        }

        api.start({ page: nextPage, immediate: true })
        return
      }

      if (!active && last) {
        // Al soltar:
        const currentPage = (page.get?.() ?? index) as number
        let targetIndex = index

        if (isSwipe) {
          // Swipe explícito según dirección
          // dx: -1 = dedo izquierda → siguiente
          // dx:  1 = dedo derecha  → anterior
          targetIndex = clampIndex(index + (dx < 0 ? 1 : -1))
        } else {
          // Snap al más cercano
          targetIndex = clampIndex(Math.round(currentPage))
        }

        api.start({
          page: targetIndex,
          onRest: () => {
            if (targetIndex !== index) {
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
              // i - page: si page es 0.3, el primero va a -30%, el segundo a 70%, etc.
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

