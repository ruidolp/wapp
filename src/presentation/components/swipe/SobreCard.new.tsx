'use client'

import { TrendingUp, TrendingDown } from 'lucide-react'
import { CirculoCategoriasGastos, CategoriaGasto } from './CirculoCategoriasGastos'
import type { Sobre, Transaccion } from '@/domain/types'

interface SobreCardProps {
  sobre: Sobre
  categorias: CategoriaGasto[]
  transacciones: Transaccion[]
  totalGastado: number
}

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
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Envelope Container - Más ancho y con sombra exterior */}
      <div className="flex-1 overflow-y-auto p-4 pb-8">
        <div
          className="relative w-[calc(100%-1rem)] max-w-2xl mx-auto"
          style={{
            filter: 'drop-shadow(0 25px 50px rgba(0,0,0,0.20))',
          }}
        >
          {/* Envelope Body */}
          <div
            className="relative rounded-3xl overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${color} 0%, ${adjustBrightness(color, -15)} 100%)`,
              boxShadow: `0 0 60px ${color}40, inset 0 2px 30px rgba(255,255,255,0.1)`,
            }}
          >
            {/* Envelope Flap (solapa) con NOMBRE */}
            <div className="relative h-28 overflow-hidden">
              <svg
                viewBox="0 0 400 110"
                className="absolute inset-0 w-full h-full"
                preserveAspectRatio="none"
              >
                {/* Flap triangulo */}
                <path
                  d="M 0 0 L 200 85 L 400 0 Z"
                  fill={adjustBrightness(color, -25)}
                  opacity="0.95"
                />
                {/* Flap fold shadow */}
                <path
                  d="M 0 0 L 200 85 L 400 0 L 400 25 L 200 110 L 0 25 Z"
                  fill="url(#flapGradient)"
                />
                <defs>
                  <linearGradient id="flapGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor={adjustBrightness(color, -30)} stopOpacity="0.6" />
                    <stop offset="100%" stopColor={adjustBrightness(color, -40)} stopOpacity="0.9" />
                  </linearGradient>
                </defs>
              </svg>

              {/* NOMBRE en la solapa */}
              <div className="absolute top-8 left-0 right-0 z-10 flex items-center justify-center">
                <h2 className="text-3xl font-extrabold font-display text-white tracking-tight text-center px-4"
                  style={{
                    textShadow: '0 4px 20px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.3)',
                  }}
                >
                  {sobre.nombre}
                </h2>
              </div>
            </div>

            {/* Envelope Content (DENTRO del sobre) */}
            <div className="relative p-5 pb-6 text-white space-y-4">
              {/* Balance Card (más compacta) */}
              <div className="bg-white/15 backdrop-blur-md rounded-2xl p-4 border border-white/20"
                style={{
                  boxShadow: '0 8px 30px rgba(0,0,0,0.15), inset 0 1px 10px rgba(255,255,255,0.1)',
                }}
              >
                {/* Presupuesto y Gastado */}
                <div className="grid grid-cols-2 gap-3 mb-3">
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
                    <div className="flex items-center gap-1.5">
                      {disponible >= 0 ? (
                        <TrendingUp className="w-3.5 h-3.5 text-green-300" />
                      ) : (
                        <TrendingDown className="w-3.5 h-3.5 text-red-300" />
                      )}
                      <span className="font-bold">
                        {disponible >= 0 ? 'Disponible' : 'Excedido'}:{' '}
                        <span className={disponible >= 0 ? 'text-green-300' : 'text-red-300'}>
                          {formatCurrency(Math.abs(disponible))}
                        </span>
                      </span>
                    </div>
                    <span className="font-semibold">
                      {porcentajeGastado.toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Gráfico Pie de Categorías (MÁS GRANDE para clicks) */}
              {categorias.length > 0 && (
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20"
                  style={{
                    boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
                  }}
                >
                  <p className="text-[10px] text-white/80 font-bold mb-3 text-center tracking-widest">
                    DISTRIBUCIÓN
                  </p>
                  <div className="flex items-center justify-center">
                    <CirculoCategoriasGastos categorias={categorias} size={280} />
                  </div>
                </div>
              )}

              {/* Transacciones DENTRO del sobre */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 space-y-3"
                style={{
                  boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
                }}
              >
                <p className="text-[10px] text-white/80 font-bold text-center tracking-widest mb-2">
                  TRANSACCIONES RECIENTES
                </p>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {Object.entries(groupedTransactions).map(([fecha, txs]) => (
                    <div key={fecha} className="space-y-2">
                      {/* Fecha Header */}
                      <p className="text-xs font-bold text-white/90 sticky top-0 bg-white/5 backdrop-blur-sm py-1 px-2 rounded-lg">
                        {formatDate(fecha)}
                      </p>
                      {/* Transacciones de esa fecha */}
                      {txs.map((tx, idx) => (
                        <div key={`${fecha}-${idx}`} className="flex items-start justify-between gap-2 text-xs bg-white/5 rounded-lg p-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white">{formatCurrency(tx.monto)}</span>
                              <span className="text-white/70">{tx.categoria}</span>
                              {tx.subcategoria && (
                                <span className="text-white/50 text-[10px]">→ {tx.subcategoria}</span>
                              )}
                            </div>
                            {tx.descripcion && (
                              <p className="text-white/60 text-[10px] mt-0.5 pl-1">{tx.descripcion}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Envelope Bottom Seal (sello) */}
            <div
              className="h-4"
              style={{
                background: `linear-gradient(to bottom, ${adjustBrightness(color, -35)}, ${adjustBrightness(color, -45)})`,
                boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.3)',
              }}
            />
          </div>
        </div>
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

function adjustBrightness(hex: string, percent: number): string {
  hex = hex.replace(/^#/, '')
  let r = parseInt(hex.substring(0, 2), 16)
  let g = parseInt(hex.substring(2, 4), 16)
  let b = parseInt(hex.substring(4, 6), 16)

  r = Math.max(0, Math.min(255, r + (r * percent) / 100))
  g = Math.max(0, Math.min(255, g + (g * percent) / 100))
  b = Math.max(0, Math.min(255, b + (b * percent) / 100))

  const toHex = (n: number) => Math.round(n).toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}
