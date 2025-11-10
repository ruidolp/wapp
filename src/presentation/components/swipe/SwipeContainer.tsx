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

  // `page` = índice visual continuo (0 = primer item, 1 = segundo, etc.)
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
    ({ active, movement: [mx], velocity: [vx], last }) => {
      if (items.length <= 1) return

      const width =
        containerRef.current?.offsetWidth ||
        (typeof window !== 'undefined' ? window.innerWidth : 1)

      const delta = mx / width

      if (active && !last) {
        // Mientras arrastro, movemos `page` en función del dedo.
        // mx > 0 (dedo a la derecha) => queremos ver más del slide anterior => page disminuye.
        // mx < 0 (dedo a la izquierda) => page aumenta.
        let nextPage = index - delta

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

      if (!active && last) {
        const current = page.get() as number

        // Heurística de swipe: desplazamiento o velocidad suficiente
        const isSwipe =
          Math.abs(delta) > 0.25 || vx > 0.25

        let target = clampIndex(Math.round(current))

        if (isSwipe) {
          // Si fue un swipe fuerte pero el redondeo no cambió de página,
          // forzamos al menos un paso en la dirección del movimiento.
          if (delta < 0 && target <= index) {
            // dedo a la izquierda => siguiente página
            target = clampIndex(index + 1)
          } else if (delta > 0 && target >= index) {
            // dedo a la derecha => página anterior
            target = clampIndex(index - 1)
          }
        }

        api.start({
          page: target,
          onRest: () => {
            if (target !== index) {
              setIndex(target)
              onIndexChange?.(target)
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
              // Todo se basa en `page`: si page = 0.3,
              // slide 0 está a -30%, slide 1 a 70%, etc.
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

