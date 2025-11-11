'use client'

import { Plus, MoreVertical } from 'lucide-react'
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
      className="relative w-full flex flex-col overflow-hidden"
      style={{
        background: sobre.color
          ? `linear-gradient(to bottom right, ${sobre.color}15, ${sobre.color}05)`
          : 'linear-gradient(to bottom right, #f8fafc, #f1f5f9)',
        height: 'calc(100vh - 180px)', // Adjust to end before indicators with minimal spacing
        maxHeight: '700px',
      }}
    >
      {/* Envelope Shape Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <EnvelopeShape color={sobre.color || '#64748b'} />
      </div>

      {/* Three Dots Menu on Envelope Flap - Always Visible */}
      <div className="absolute top-8 right-6 z-20">
        <button
          className="p-2 rounded-full bg-white/60 backdrop-blur-sm hover:bg-white/80 shadow-sm transition-all border border-white/80"
          onClick={() => {
            // TODO: Handle menu click
            console.log('Menu clicked')
          }}
        >
          <MoreVertical className="w-5 h-5 text-slate-700" />
        </button>
      </div>

      {/* Circular Progress Chart - Bottom Right */}
      <div className="absolute bottom-6 right-6 z-20">
        <div className="flex flex-col items-end gap-1">
          <span className="text-xs font-semibold text-slate-700">Gastado:</span>
          <div className="w-20 h-20">
            <CircularProgress
              gastado={totalGastado}
              presupuesto={presupuesto}
              porcentaje={porcentajeGastado}
              color={sobre.color || undefined}
            />
          </div>
        </div>
      </div>

      {/* Content - Scrollable */}
      <div className="relative z-10 flex-1 overflow-y-auto">
        <div className="px-6 py-6 space-y-6 pb-32">
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

// Circular Progress Chart for bottom right corner - smaller size
function CircularProgress({
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
  const radius = 32
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (Math.min(porcentaje, 100) / 100) * circumference

  const strokeColor = porcentaje > 100 ? '#dc2626' : porcentaje > 80 ? '#ea580c' : color || '#10b981'

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-white/60 backdrop-blur-sm rounded-full shadow-md border border-white/80">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 72 72">
        {/* Background circle */}
        <circle
          cx="36"
          cy="36"
          r={radius}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="6"
        />
        {/* Progress circle */}
        <circle
          cx="36"
          cy="36"
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth="6"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>
      {/* Percentage text in center */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className="text-sm font-bold"
          style={{ color: strokeColor }}
        >
          {Math.round(porcentaje)}%
        </span>
      </div>
    </div>
  )
}

// Envelope SVG Shape (trapezoid: wider at top, narrower at bottom)
function EnvelopeShape({ color }: { color: string }) {
  return (
    <svg
      viewBox="0 0 400 300"
      className="w-full h-auto opacity-10"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMin meet"
    >
      <defs>
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.3"/>
        </filter>
        <linearGradient id="envelopeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{ stopColor: color, stopOpacity: 0.4 }} />
          <stop offset="100%" style={{ stopColor: color, stopOpacity: 0.2 }} />
        </linearGradient>
      </defs>

      {/* Trapezoid envelope body - wider at top, narrower at bottom */}
      <path
        d="M 30 100 L 370 100 L 320 280 L 80 280 Z"
        fill="url(#envelopeGradient)"
        filter="url(#shadow)"
      />

      {/* Triangle flap */}
      <path
        d="M 30 100 L 200 180 L 370 100 Z"
        fill={color}
        opacity="0.5"
        stroke={color}
        strokeWidth="2"
        strokeOpacity="0.7"
      />

      {/* Envelope edges with shadow effect */}
      <path
        d="M 30 100 L 80 280 L 320 280 L 370 100"
        fill="none"
        stroke={color}
        strokeWidth="2"
        opacity="0.6"
      />

      {/* Diagonal fold lines */}
      <line
        x1="30"
        y1="100"
        x2="200"
        y2="180"
        stroke={color}
        strokeWidth="1.5"
        opacity="0.5"
        strokeDasharray="3 3"
      />
      <line
        x1="370"
        y1="100"
        x2="200"
        y2="180"
        stroke={color}
        strokeWidth="1.5"
        opacity="0.5"
        strokeDasharray="3 3"
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
