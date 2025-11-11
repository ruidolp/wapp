'use client'

import { TrendingUp, TrendingDown, MoreVertical } from 'lucide-react'
import { CategoriaGasto } from './CirculoCategoriasGastos'
import type { Sobre, Transaccion } from '@/domain/types'

interface SobreCardProps {
  sobre: Sobre
  categorias: CategoriaGasto[]
  transacciones: Transaccion[]
  totalGastado: number
}

// 8 Categorías dummy con colores del theme
const DUMMY_CATEGORIAS: CategoriaGasto[] = [
  { id: '1', nombre: 'Comida', emoji: '🍔', color: '#3b82f6', gastado: 45000, presupuesto: 60000 },
  { id: '2', nombre: 'Transporte', emoji: '🚗', color: '#8b5cf6', gastado: 32000, presupuesto: 40000 },
  { id: '3', nombre: 'Servicios', emoji: '💡', color: '#10b981', gastado: 25000, presupuesto: 30000 },
  { id: '4', nombre: 'Entretenimiento', emoji: '🎮', color: '#f59e0b', gastado: 18500, presupuesto: 25000 },
  { id: '5', nombre: 'Salud', emoji: '💊', color: '#ef4444', gastado: 15700, presupuesto: 20000 },
  { id: '6', nombre: 'Educación', emoji: '📚', color: '#06b6d4', gastado: 12300, presupuesto: 15000 },
  { id: '7', nombre: 'Hogar', emoji: '🏠', color: '#84cc16', gastado: 9200, presupuesto: 12000 },
  { id: '8', nombre: 'Otros', emoji: '🎁', color: '#6b7280', gastado: 5500, presupuesto: 8000 },
]

// Transacciones dummy
const DUMMY_TRANSACTIONS = [
  // 11 enero 2025
  { fecha: '2025-01-11', monto: 45000, categoria: 'Supermercado', subcategoria: 'Frutas y Verduras', descripcion: 'Compra semanal en Riba Smith' },
  { fecha: '2025-01-11', monto: 12500, categoria: 'Transporte', subcategoria: null, descripcion: null },
  { fecha: '2025-01-11', monto: 8300, categoria: 'Comida', subcategoria: 'Almuerzo', descripcion: 'Lunch en Food Court' },
  // 08 enero 2025
  { fecha: '2025-01-08', monto: 32000, categoria: 'Servicios', subcategoria: 'Internet', descripcion: null },
  { fecha: '2025-01-08', monto: 15700, categoria: 'Supermercado', subcategoria: 'Carnes', descripcion: 'Compras Super 99' },
  { fecha: '2025-01-08', monto: 9200, categoria: 'Entretenimiento', subcategoria: null, descripcion: null },
  { fecha: '2025-01-08', monto: 5500, categoria: 'Comida', subcategoria: 'Café', descripcion: null },
  // 01 enero 2025
  { fecha: '2025-01-01', monto: 120000, categoria: 'Hogar', subcategoria: 'Alquiler', descripcion: 'Pago de renta mensual' },
  { fecha: '2025-01-01', monto: 25000, categoria: 'Servicios', subcategoria: 'Electricidad', descripcion: null },
  { fecha: '2025-01-01', monto: 18500, categoria: 'Transporte', subcategoria: 'Gasolina', descripcion: 'Tanque lleno' },
]

export function SobreCard({
  sobre,
  categorias,
  transacciones,
  totalGastado,
}: SobreCardProps) {
  const presupuesto = sobre.presupuesto_asignado
  const porcentajeGastado = presupuesto > 0 ? (totalGastado / presupuesto) * 100 : 0
  const disponible = presupuesto - totalGastado
  const color = sobre.color || '#8b5cf6'

  // Agrupar transacciones por fecha
  const groupedTransactions = DUMMY_TRANSACTIONS.reduce((acc, tx) => {
    if (!acc[tx.fecha]) {
      acc[tx.fecha] = []
    }
    acc[tx.fecha].push(tx)
    return acc
  }, {} as Record<string, typeof DUMMY_TRANSACTIONS>)

  return (
    <div
      className="w-full flex flex-col bg-background"
      style={{
        height: 'calc(100vh - 180px)',
        maxHeight: '700px',
      }}
    >
      {/* Envelope Container - Con márgenes laterales */}
      <div className="flex-1 overflow-y-auto pb-6 px-3 pt-2">
        <div
          className="relative w-full"
          style={{
            filter: `drop-shadow(0 25px 50px ${color}33)`,
          }}
        >
          {/* Envelope Body - Trapezoid Shape (wider at top, narrower at bottom) */}
          <div className="relative overflow-hidden">
            <svg
              viewBox="0 0 400 500"
              className="absolute inset-0 w-full h-full"
              preserveAspectRatio="none"
              style={{ zIndex: 0 }}
            >
              <defs>
                <linearGradient id={`envelopeGradient-${sobre.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={color} />
                  <stop offset="100%" stopColor={adjustBrightness(color, -15)} />
                </linearGradient>
                <filter id={`shadow-${sobre.id}`}>
                  <feDropShadow dx="0" dy="4" stdDeviation="8" floodOpacity="0.4"/>
                </filter>
              </defs>

              {/* Trapezoid body - wider at top, narrower at bottom */}
              <path
                d="M 20 80 L 380 80 L 340 480 L 60 480 Z"
                fill={`url(#envelopeGradient-${sobre.id})`}
                filter={`url(#shadow-${sobre.id})`}
              />

              {/* Border outline */}
              <path
                d="M 20 80 L 60 480 L 340 480 L 380 80 Z"
                fill="none"
                stroke={adjustBrightness(color, -20)}
                strokeWidth="2"
                opacity="0.6"
              />
            </svg>

            {/* Envelope Flap (solapa) */}
            <div className="relative h-20 overflow-hidden" style={{ zIndex: 1 }}>
              <svg
                viewBox="0 0 400 80"
                className="absolute inset-0 w-full h-full"
                preserveAspectRatio="none"
              >
                {/* Flap triangulo */}
                <path
                  d="M 20 0 L 200 65 L 380 0 Z"
                  fill={adjustBrightness(color, -25)}
                  opacity="0.95"
                />
                {/* Flap fold shadow */}
                <path
                  d="M 20 0 L 200 65 L 380 0 L 380 20 L 200 85 L 20 20 Z"
                  fill={`url(#flapGradient-${sobre.id})`}
                />
                {/* Línea de cierre más clara */}
                <path
                  d="M 20 0 L 200 65 L 380 0"
                  stroke={adjustBrightness(color, 40)}
                  strokeWidth="2"
                  fill="none"
                  opacity="0.7"
                />
                <defs>
                  <linearGradient id={`flapGradient-${sobre.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor={adjustBrightness(color, -30)} stopOpacity="0.6" />
                    <stop offset="100%" stopColor={adjustBrightness(color, -40)} stopOpacity="0.9" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Three Dots Menu - Always Visible */}
              <div className="absolute top-4 right-6 z-20">
                <button
                  className="p-1.5 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all"
                  onClick={() => {
                    console.log('Menu clicked')
                  }}
                >
                  <MoreVertical className="w-4 h-4 text-white" />
                </button>
              </div>

              {/* NOMBRE en la solapa */}
              <div className="absolute top-6 left-0 right-0 z-10 flex items-center justify-center">
                <h2 className="text-2xl font-extrabold font-display text-white tracking-tight text-center px-4"
                  style={{
                    textShadow: '0 4px 20px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.3)',
                  }}
                >
                  {sobre.nombre}
                </h2>
              </div>
            </div>

            {/* Envelope Content (DENTRO del sobre) */}
            <div className="relative pt-0 px-5 pb-6 text-white space-y-3">
              {/* Balance Card - MÁS TRANSPARENTE y más arriba */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/20 -mt-2"
                style={{
                  boxShadow: '0 8px 30px rgba(0,0,0,0.15), inset 0 1px 10px rgba(255,255,255,0.1)',
                }}
              >
                {/* Presupuesto y Gastado */}
                <div className="grid grid-cols-2 gap-3 mb-2">
                  <div className="text-left">
                    <p className="text-[10px] text-white/70 font-semibold mb-0.5 tracking-wider">PRESUPUESTO</p>
                    <p className="text-xl font-extrabold font-display">
                      {formatCurrency(presupuesto)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-white/70 font-semibold mb-0.5 tracking-wider">GASTADO</p>
                    <p className="text-xl font-extrabold font-display">
                      {formatCurrency(totalGastado)}
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="relative w-full h-2.5 bg-black/20 rounded-full overflow-hidden"
                    style={{
                      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)',
                    }}
                  >
                    <div
                      className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${
                        porcentajeGastado > 100
                          ? 'bg-gradient-to-r from-red-400 to-red-500'
                          : porcentajeGastado > 80
                          ? 'bg-gradient-to-r from-yellow-400 to-orange-400'
                          : 'bg-gradient-to-r from-green-400 to-emerald-400'
                      }`}
                      style={{
                        width: `${Math.min(porcentajeGastado, 100)}%`,
                        boxShadow: '0 0 10px currentColor',
                      }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-1">
                      {disponible >= 0 ? (
                        <TrendingUp className="w-3.5 h-3.5 text-green-300" />
                      ) : (
                        <TrendingDown className="w-3.5 h-3.5 text-red-300" />
                      )}
                      <span className="font-semibold text-white/80">
                        {disponible >= 0 ? 'Disponible' : 'Excedido'}:{' '}
                        <span className={disponible >= 0 ? 'text-green-300' : 'text-red-300'}>
                          {formatCurrency(Math.abs(disponible))}
                        </span>
                      </span>
                    </div>
                    <span className="font-semibold text-white/80">
                      {porcentajeGastado.toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Listado de Categorías - Reemplaza el CirculoCategoriasGastos */}
              <div className="space-y-2 max-h-72 overflow-y-auto pb-24">
                {DUMMY_CATEGORIAS.map((categoria) => (
                  <CategoriaButton
                    key={categoria.id}
                    categoria={categoria}
                    presupuesto={presupuesto}
                  />
                ))}
              </div>
            </div>

            {/* Circular Progress Chart - Bottom Right */}
            <div className="absolute bottom-4 right-4 z-20">
              <div className="flex flex-col items-end gap-0.5">
                <span className="text-[10px] font-semibold text-white/80">Gastado:</span>
                <div className="w-16 h-16">
                  <LargeCircularProgress
                    porcentaje={porcentajeGastado}
                    color={color}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Transacciones FUERA del sobre - Con bg-card */}
        {DUMMY_TRANSACTIONS.length > 0 && (
          <div className="mt-6 px-2">
            <h3 className="text-base font-bold text-foreground mb-3 font-display">
              Transacciones Recientes
            </h3>
            <div className="bg-card rounded-2xl border border-border overflow-hidden"
              style={{
                boxShadow: '0 8px 25px hsl(var(--primary) / 0.08)',
              }}
            >
              <div className="p-3 space-y-3">
                {Object.entries(groupedTransactions).map(([fecha, txs]) => (
                  <div key={fecha} className="space-y-2">
                    {/* Fecha Header */}
                    <p className="text-sm font-bold text-foreground bg-muted/50 py-1 px-2 rounded-lg">
                      {formatDate(fecha)}
                    </p>
                    {/* Transacciones de esa fecha */}
                    {txs.map((tx, idx) => (
                      <div key={`${fecha}-${idx}`} className="bg-muted/30 rounded-lg p-2.5 border border-border/50">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-bold text-foreground">{formatCurrency(tx.monto)}</span>
                              <span className="text-sm text-muted-foreground">{tx.categoria}</span>
                              {tx.subcategoria && (
                                <span className="text-xs text-muted-foreground">→ {tx.subcategoria}</span>
                              )}
                            </div>
                            {tx.descripcion && (
                              <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">{tx.descripcion}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Botón de Categoría con mini gráfico circular
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
      className="w-full bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-xl p-3 border border-white/20 transition-all text-left flex items-center gap-3"
      onClick={() => {
        console.log('Category clicked:', categoria.nombre)
      }}
    >
      {/* Info de categoría */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          {categoria.emoji && <span className="text-lg">{categoria.emoji}</span>}
          <span className="font-bold text-white truncate text-sm">
            {categoria.nombre}
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="text-white/70">
            <span className="font-bold text-white">{formatCurrency(categoria.gastado)}</span>
          </span>
          <span
            className={`font-semibold ${
              porcentaje > 100
                ? 'text-red-300'
                : porcentaje > 80
                ? 'text-yellow-300'
                : 'text-green-300'
            }`}
          >
            {porcentaje.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Mini gráfico circular */}
      <div className="w-14 h-14 flex-shrink-0">
        <MiniProgressChart
          porcentaje={porcentaje}
          color={categoria.color}
        />
      </div>
    </button>
  )
}

// Mini gráfico circular SVG
function MiniProgressChart({
  porcentaje,
  color,
}: {
  porcentaje: number
  color?: string
}) {
  const radius = 20
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (Math.min(porcentaje, 100) / 100) * circumference

  const strokeColor = porcentaje > 100 ? '#fca5a5' : porcentaje > 80 ? '#fde047' : '#86efac'

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 48 48">
        {/* Círculo de fondo */}
        <circle
          cx="24"
          cy="24"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="3"
        />
        {/* Círculo de progreso */}
        <circle
          cx="24"
          cy="24"
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth="3"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>
      {/* Porcentaje en el centro */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className="text-[9px] font-bold text-white"
        >
          {Math.round(porcentaje)}%
        </span>
      </div>
    </div>
  )
}

// Large circular progress chart for bottom right corner
function LargeCircularProgress({
  porcentaje,
  color,
}: {
  porcentaje: number
  color: string
}) {
  const radius = 24
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (Math.min(porcentaje, 100) / 100) * circumference

  const strokeColor = porcentaje > 100 ? '#fca5a5' : porcentaje > 80 ? '#fde047' : '#86efac'

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-white/20 backdrop-blur-md rounded-full border border-white/30 shadow-lg">
      <svg className="w-full h-full -rotate-90 p-2" viewBox="0 0 56 56">
        {/* Círculo de fondo */}
        <circle
          cx="28"
          cy="28"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="4"
        />
        {/* Círculo de progreso */}
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
      {/* Porcentaje en el centro */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold text-white">
          {Math.round(porcentaje)}%
        </span>
      </div>
    </div>
  )
}

// Helper Functions
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-PA', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-')
  const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
  return `${parseInt(day)} ${months[parseInt(month) - 1]} ${year}`
}

function adjustBrightness(color: string, percent: number): string {
  const num = parseInt(color.replace('#', ''), 16)
  const amt = Math.round(2.55 * percent)
  const R = (num >> 16) + amt
  const G = ((num >> 8) & 0x00ff) + amt
  const B = (num & 0x0000ff) + amt
  return (
    '#' +
    (
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    )
      .toString(16)
      .slice(1)
  )
}
