'use client'

import { TrendingUp, TrendingDown } from 'lucide-react'
import { CirculoCategoriasGastos, CategoriaGasto } from './CirculoCategoriasGastos'
import { TransaccionesList } from './TransaccionesList'
import type { Sobre, Transaccion } from '@/domain/types'

interface SobreCardProps {
  sobre: Sobre
  categorias: CategoriaGasto[]
  transacciones: Transaccion[]
  totalGastado: number
}

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

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-slate-50 via-white to-slate-50 overflow-hidden">
      {/* Envelope Container con sombra exterior */}
      <div className="flex-1 overflow-y-auto p-6">
        <div
          className="relative w-[calc(100%-2rem)] max-w-lg mx-auto"
          style={{
            filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.15))',
          }}
        >
          {/* Envelope Body */}
          <div
            className="relative rounded-2xl overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${color} 0%, ${adjustBrightness(color, -15)} 100%)`,
            }}
          >
            {/* Envelope Flap (solapa) */}
            <div className="relative h-24 overflow-hidden">
              <svg
                viewBox="0 0 400 100"
                className="absolute inset-0 w-full h-full"
                preserveAspectRatio="none"
              >
                {/* Flap triangulo */}
                <path
                  d="M 0 0 L 200 80 L 400 0 Z"
                  fill={adjustBrightness(color, -25)}
                  opacity="0.9"
                />
                {/* Flap fold shadow */}
                <path
                  d="M 0 0 L 200 80 L 400 0 L 400 20 L 200 100 L 0 20 Z"
                  fill="url(#flapGradient)"
                />
                <defs>
                  <linearGradient id="flapGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor={adjustBrightness(color, -30)} stopOpacity="0.5" />
                    <stop offset="100%" stopColor={adjustBrightness(color, -40)} stopOpacity="0.8" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Emoji en la solapa */}
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/40 flex items-center justify-center shadow-xl">
                  <span className="text-3xl">{sobre.emoji || '💰'}</span>
                </div>
              </div>
            </div>

            {/* Envelope Content (dentro del sobre) */}
            <div className="relative p-6 pt-2 pb-8 text-white">
              {/* Nombre del sobre */}
              <h2 className="text-2xl font-extrabold font-display text-center mb-6 tracking-tight">
                {sobre.nombre}
              </h2>

              {/* Balance Card (dentro del sobre) */}
              <div className="bg-white/15 backdrop-blur-md rounded-xl p-5 mb-5 border border-white/20 shadow-2xl">
                {/* Presupuesto y Gastado */}
                <div className="flex items-center justify-between mb-4">
                  <div className="text-left">
                    <p className="text-xs text-white/70 font-medium mb-1">PRESUPUESTO</p>
                    <p className="text-2xl font-extrabold font-display">
                      {formatCurrency(presupuesto)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-white/70 font-medium mb-1">GASTADO</p>
                    <p className="text-2xl font-extrabold font-display">
                      {formatCurrency(totalGastado)}
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="relative w-full h-3 bg-black/20 rounded-full overflow-hidden">
                    <div
                      className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 shadow-lg ${
                        porcentajeGastado > 100
                          ? 'bg-gradient-to-r from-red-400 to-red-500'
                          : porcentajeGastado > 80
                          ? 'bg-gradient-to-r from-yellow-400 to-orange-400'
                          : 'bg-gradient-to-r from-green-400 to-emerald-400'
                      }`}
                      style={{ width: `${Math.min(porcentajeGastado, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      {disponible >= 0 ? (
                        <TrendingUp className="w-4 h-4 text-green-300" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-300" />
                      )}
                      <span className="text-sm font-bold">
                        {disponible >= 0 ? 'Disponible' : 'Excedido'}:{' '}
                        <span className={disponible >= 0 ? 'text-green-300' : 'text-red-300'}>
                          {formatCurrency(Math.abs(disponible))}
                        </span>
                      </span>
                    </div>
                    <span className="text-sm font-semibold">
                      {porcentajeGastado.toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Categorías */}
              {categorias.length > 0 && (
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <p className="text-xs text-white/80 font-semibold mb-3 text-center tracking-wide">
                    DISTRIBUCIÓN POR CATEGORÍA
                  </p>
                  <div className="flex items-center justify-center">
                    <CirculoCategoriasGastos categorias={categorias} size={220} />
                  </div>
                </div>
              )}
            </div>

            {/* Envelope Bottom Seal (sello) */}
            <div
              className="h-3"
              style={{
                background: `linear-gradient(to bottom, ${adjustBrightness(color, -35)}, ${adjustBrightness(color, -45)})`,
              }}
            />
          </div>
        </div>

        {/* Transacciones (fuera del sobre) */}
        {transacciones.length > 0 && (
          <div className="mt-8 px-4">
            <h3 className="text-lg font-bold text-slate-800 mb-4 font-display">
              Últimas Transacciones
            </h3>
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200/50 overflow-hidden">
              <TransaccionesList transacciones={transacciones.slice(0, 5)} />
            </div>
          </div>
        )}
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
