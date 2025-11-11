'use client'

import { Plus } from 'lucide-react'
import { TransaccionesList } from './TransaccionesList'
import type { Sobre, Transaccion } from '@/domain/types'
import { CategoriaGasto } from './CirculoCategoriasGastos'

interface SobreCardProps {
  sobre: Sobre
  categorias: CategoriaGasto[]
  transacciones: Transaccion[]
  totalGastado: number
  onRegistrarGasto?: () => void
}

export function SobreCard({
  sobre,
  categorias,
  transacciones,
  totalGastado,
  onRegistrarGasto,
}: SobreCardProps) {
  const presupuesto = sobre.presupuesto_asignado
  const porcentajeGastado = presupuesto > 0 ? (totalGastado / presupuesto) * 100 : 0
  const disponible = presupuesto - totalGastado

  return (
    <div
      className="relative w-full h-full flex flex-col overflow-hidden"
      style={{
        background: sobre.color
          ? `linear-gradient(to bottom right, ${sobre.color}15, ${sobre.color}05)`
          : 'linear-gradient(to bottom right, #f8fafc, #f1f5f9)',
      }}
    >
      {/* Envelope Shape Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <EnvelopeShape color={sobre.color || '#64748b'} />
      </div>

      {/* Content - Scrollable */}
      <div className="relative z-10 flex-1 overflow-y-auto">
        <div className="px-6 py-6 space-y-6">
          {/* Header with progress bar - NOW WITH TRANSPARENCY */}
          <div className="bg-white/40 backdrop-blur-sm rounded-xl p-4 border border-white/60 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                {sobre.emoji && <span className="text-2xl">{sobre.emoji}</span>}
                {sobre.nombre}
              </h2>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-700 font-medium">
                  Gastado: {formatCurrency(totalGastado)}
                </span>
                <span className="text-slate-600">
                  de {formatCurrency(presupuesto)}
                </span>
              </div>
              <div className="relative w-full h-3 bg-white/60 rounded-full overflow-hidden shadow-inner">
                <div
                  className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${
                    porcentajeGastado > 100
                      ? 'bg-gradient-to-r from-red-500 to-red-600'
                      : porcentajeGastado > 80
                      ? 'bg-gradient-to-r from-orange-500 to-orange-600'
                      : 'bg-gradient-to-r from-green-500 to-green-600'
                  }`}
                  style={{ width: `${Math.min(porcentajeGastado, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs">
                <span
                  className={`font-semibold ${
                    disponible < 0
                      ? 'text-red-700'
                      : disponible < presupuesto * 0.2
                      ? 'text-orange-700'
                      : 'text-green-700'
                  }`}
                >
                  Disponible: {formatCurrency(disponible)}
                </span>
                <span className="text-slate-600">
                  {porcentajeGastado.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          {/* Categories List */}
          {categorias.length > 0 ? (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                Categorías
              </h3>
              {categorias.map((categoria) => (
                <CategoriaButton key={categoria.nombre} categoria={categoria} presupuesto={presupuesto} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/60 flex items-center justify-center">
                <Plus className="w-10 h-10 text-slate-400" />
              </div>
              <p className="text-slate-600 font-medium mb-1">
                No hay categorías vinculadas
              </p>
              <p className="text-sm text-slate-500">
                Vincula categorías para comenzar a rastrear gastos
              </p>
            </div>
          )}

          {/* Transactions List */}
          {transacciones.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wider">
                Transacciones Recientes
              </h3>
              <TransaccionesList transacciones={transacciones} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Category Button with mini chart
function CategoriaButton({
  categoria,
  presupuesto,
}: {
  categoria: CategoriaGasto
  presupuesto: number
}) {
  const porcentaje = presupuesto > 0 ? (categoria.gastado / presupuesto) * 100 : 0

  return (
    <button
      className="w-full bg-white/60 backdrop-blur-sm hover:bg-white/80 rounded-lg p-3 border border-white/80 shadow-sm transition-all hover:shadow-md text-left flex items-center gap-3"
      onClick={() => {
        // TODO: Handle category click
        console.log('Category clicked:', categoria.nombre)
      }}
    >
      {/* Category Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          {categoria.emoji && <span className="text-lg">{categoria.emoji}</span>}
          <span className="font-semibold text-slate-800 truncate">
            {categoria.nombre}
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="text-slate-600">
            Gastado: <span className="font-bold text-slate-800">{formatCurrency(categoria.gastado)}</span>
          </span>
          <span
            className={`font-semibold ${
              porcentaje > 100
                ? 'text-red-600'
                : porcentaje > 80
                ? 'text-orange-600'
                : 'text-green-600'
            }`}
          >
            {porcentaje.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Mini Progress Chart */}
      <div className="w-16 h-16 flex-shrink-0">
        <MiniProgressChart
          gastado={categoria.gastado}
          presupuesto={presupuesto}
          porcentaje={porcentaje}
          color={categoria.color}
        />
      </div>
    </button>
  )
}

// Mini circular progress chart for each category
function MiniProgressChart({
  gastado,
  presupuesto,
  porcentaje,
  color,
}: {
  gastado: number
  presupuesto: number
  porcentaje: number
  color?: string
}) {
  const radius = 24
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (Math.min(porcentaje, 100) / 100) * circumference

  const strokeColor = porcentaje > 100 ? '#dc2626' : porcentaje > 80 ? '#ea580c' : color || '#10b981'

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 56 56">
        {/* Background circle */}
        <circle
          cx="28"
          cy="28"
          r={radius}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="4"
        />
        {/* Progress circle */}
        <circle
          cx="28"
          cy="28"
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>
      {/* Percentage text in center */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className="text-[10px] font-bold"
          style={{ color: strokeColor }}
        >
          {Math.round(porcentaje)}%
        </span>
      </div>
    </div>
  )
}

// Envelope SVG Shape (closed envelope with triangle flap)
function EnvelopeShape({ color }: { color: string }) {
  return (
    <svg
      viewBox="0 0 400 400"
      className="w-full h-full opacity-10"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Envelope body */}
      <rect
        x="50"
        y="150"
        width="300"
        height="200"
        rx="8"
        fill={color}
        opacity="0.3"
      />

      {/* Triangle flap (closed envelope) */}
      <path
        d="M 50 150 L 200 250 L 350 150 Z"
        fill={color}
        opacity="0.4"
        stroke={color}
        strokeWidth="2"
        strokeOpacity="0.6"
      />

      {/* Back flap lines */}
      <line
        x1="50"
        y1="150"
        x2="50"
        y2="350"
        stroke={color}
        strokeWidth="2"
        opacity="0.5"
      />
      <line
        x1="350"
        y1="150"
        x2="350"
        y2="350"
        stroke={color}
        strokeWidth="2"
        opacity="0.5"
      />
      <line
        x1="50"
        y1="350"
        x2="350"
        y2="350"
        stroke={color}
        strokeWidth="2"
        opacity="0.5"
      />

      {/* Diagonal fold lines */}
      <line
        x1="50"
        y1="150"
        x2="200"
        y2="250"
        stroke={color}
        strokeWidth="2"
        opacity="0.6"
        strokeDasharray="4 4"
      />
      <line
        x1="350"
        y1="150"
        x2="200"
        y2="250"
        stroke={color}
        strokeWidth="2"
        opacity="0.6"
        strokeDasharray="4 4"
      />
    </svg>
  )
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-PA', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount)
}
