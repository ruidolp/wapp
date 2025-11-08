'use client'

import { useMemo } from 'react'

export interface CategoriaGasto {
  id: string
  nombre: string
  emoji?: string | null
  color: string
  gastado: number
  presupuesto: number
}

interface CirculoCategoriasGastosProps {
  categorias: CategoriaGasto[]
  size?: number
}

export function CirculoCategoriasGastos({
  categorias,
  size = 280,
}: CirculoCategoriasGastosProps) {
  const total = useMemo(
    () => categorias.reduce((sum, cat) => sum + cat.gastado, 0),
    [categorias]
  )

  const segments = useMemo(() => {
    let currentAngle = -90 // Start from top

    return categorias.map((cat, index) => {
      const percentage = total > 0 ? (cat.gastado / total) * 100 : 0
      const angle = (percentage / 100) * 360
      const startAngle = currentAngle
      const endAngle = currentAngle + angle

      // Calculate position for icon (midpoint of arc)
      const midAngle = (startAngle + endAngle) / 2
      const iconRadius = size / 2 - 40 // Position icons closer to edge
      const iconX = size / 2 + iconRadius * Math.cos((midAngle * Math.PI) / 180)
      const iconY = size / 2 + iconRadius * Math.sin((midAngle * Math.PI) / 180)

      currentAngle += angle

      return {
        ...cat,
        percentage,
        angle,
        startAngle,
        endAngle,
        iconX,
        iconY,
      }
    })
  }, [categorias, total, size])

  const radius = size / 2 - 10
  const strokeWidth = 60

  return (
    <div
      className="relative mx-auto"
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
        />

        {/* Category segments */}
        {segments.map((segment, index) => {
          if (segment.percentage === 0) return null

          const path = describeArc(
            size / 2,
            size / 2,
            radius,
            segment.startAngle,
            segment.endAngle
          )

          return (
            <path
              key={segment.id}
              d={path}
              fill="none"
              stroke={segment.color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              className="transition-all duration-300 hover:opacity-80"
              style={{
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
              }}
            />
          )
        })}
      </svg>

      {/* Category Icons (positioned on the circle) */}
      {segments.map((segment, index) => {
        if (segment.percentage < 5) return null // Hide icons for very small segments

        return (
          <div
            key={`icon-${segment.id}`}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            style={{
              left: segment.iconX,
              top: segment.iconY,
            }}
          >
            <div className="flex flex-col items-center gap-1">
              {segment.emoji && (
                <span className="text-2xl filter drop-shadow-lg">
                  {segment.emoji}
                </span>
              )}
              <span className="text-[10px] font-bold text-white bg-black/60 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                {segment.percentage.toFixed(0)}%
              </span>
            </div>
          </div>
        )
      })}

      {/* Center Info */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <p className="text-sm text-slate-600 mb-1">Total Gastado</p>
        <p className="text-2xl font-bold text-slate-900">
          {formatCurrency(total)}
        </p>
      </div>
    </div>
  )
}

// Helper to create SVG arc path
function describeArc(
  x: number,
  y: number,
  radius: number,
  startAngle: number,
  endAngle: number
): string {
  const start = polarToCartesian(x, y, radius, endAngle)
  const end = polarToCartesian(x, y, radius, startAngle)
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1'

  return [
    'M',
    start.x,
    start.y,
    'A',
    radius,
    radius,
    0,
    largeArcFlag,
    0,
    end.x,
    end.y,
  ].join(' ')
}

function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number
) {
  const angleInRadians = (angleInDegrees * Math.PI) / 180.0
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  }
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-PA', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount)
}
