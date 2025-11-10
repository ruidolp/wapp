'use client'

import { CreditCard, Wallet, PiggyBank, TrendingUp, DollarSign } from 'lucide-react'
import type { Billetera } from '@/domain/types'

interface BilleterasCardProps {
  billeteras: Billetera[]
  onClickCuenta?: (billetera: Billetera) => void
}

export function BilleterasCard({
  billeteras,
  onClickCuenta,
}: BilleterasCardProps) {
  const totalReal = billeteras.reduce((sum, b) => sum + b.saldo_real, 0)
  // Dummy: Asumimos que 60% está asignado a sobres
  const totalProyectado = totalReal * 0.4

  if (billeteras.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center shadow-inner">
            <Wallet className="w-12 h-12 text-slate-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-700 font-display mb-2">
              Sin billeteras
            </h3>
            <p className="text-sm text-slate-500">
              Crea tu primera cuenta para comenzar
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Balance Total - MÁS COMPACTO */}
      <div className="px-4 pt-4 pb-3">
        <div
          className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl p-4 transform hover:scale-[1.01] transition-transform"
          style={{
            boxShadow: '0 10px 40px rgba(147, 51, 234, 0.35), 0 0 30px rgba(59, 130, 246, 0.2)',
          }}
        >
          <div className="flex items-center justify-between text-white/80 mb-1">
            <span className="text-xs font-semibold tracking-wide">BALANCE TOTAL</span>
            <DollarSign className="w-4 h-4" />
          </div>
          <p className="text-3xl font-extrabold text-white font-display tracking-tight">
            {formatCurrency(totalReal)}
          </p>
          <div className="flex items-center justify-between mt-2 text-xs text-white/60">
            <span>{billeteras.length} {billeteras.length === 1 ? 'cuenta' : 'cuentas'}</span>
            <span>Proyectado: {formatCurrency(totalProyectado)}</span>
          </div>
        </div>
      </div>

      {/* Billeteras List - Scrollable */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3">
        {billeteras.map(billetera => (
          <WalletCard
            key={billetera.id}
            billetera={billetera}
            onClick={() => onClickCuenta?.(billetera)}
          />
        ))}
      </div>
    </div>
  )
}

// Wallet Card - Más compacta con SALDO REAL y PROYECTADO
function WalletCard({
  billetera,
  onClick,
}: {
  billetera: Billetera
  onClick: () => void
}) {
  const bgColor = billetera.color || getColorByType(billetera.tipo)
  const Icon = getIconByType(billetera.tipo)

  // Dummy data: Asumimos que 60% está asignado a sobres
  const saldoReal = billetera.saldo_real
  const saldoProyectado = saldoReal * 0.4
  const asignado = saldoReal * 0.6
  const porcentajeAsignado = 60 // 60% asignado, 40% libre

  return (
    <button
      onClick={onClick}
      className="w-[calc(100%-0.5rem)] mx-1 group relative"
      style={{
        perspective: '1000px',
      }}
    >
      {/* Shadow Halo (profundidad) */}
      <div
        className="absolute -inset-1.5 rounded-2xl blur-2xl opacity-40 group-hover:opacity-60 transition-opacity"
        style={{
          backgroundColor: bgColor,
          boxShadow: `0 0 40px ${bgColor}`,
        }}
      />

      {/* Wallet Container */}
      <div
        className="relative rounded-2xl overflow-hidden transform transition-all duration-300 group-hover:scale-[1.02] group-hover:-translate-y-1"
        style={{
          transformStyle: 'preserve-3d',
          boxShadow: `0 10px 30px ${bgColor}40`,
        }}
      >
        {/* Main Wallet Content - MÁS COMPACTO */}
        <div
          className="relative px-4 py-3 text-white"
          style={{
            background: `linear-gradient(135deg, ${bgColor} 0%, ${adjustBrightness(bgColor, -20)} 100%)`,
          }}
        >
          {/* Top Row: Icon - Nombre - Tipo */}
          <div className="flex items-center justify-between gap-3 mb-3">
            {/* Emoji/Icon */}
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0"
              style={{
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              }}
            >
              {billetera.emoji ? (
                <span className="text-xl">{billetera.emoji}</span>
              ) : (
                <Icon className="w-5 h-5 text-white" />
              )}
            </div>

            {/* Nombre (centro) */}
            <div className="flex-1 min-w-0">
              <p className="text-base font-bold font-display text-center truncate">
                {billetera.nombre}
              </p>
            </div>

            {/* Tipo Badge */}
            <div className="px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm flex-shrink-0">
              <span className="text-[10px] font-bold tracking-wider">
                {getTipoLabel(billetera.tipo)}
              </span>
            </div>
          </div>

          {/* SALDO REAL */}
          <div className="mb-2.5">
            <div className="flex items-baseline justify-between mb-1">
              <span className="text-[10px] font-semibold text-white/70 tracking-wider">SALDO REAL</span>
              <span className="text-lg font-extrabold font-display">{formatCurrency(saldoReal)}</span>
            </div>
            {/* Barra horizontal */}
            <div className="relative w-full h-1.5 bg-black/20 rounded-full overflow-hidden"
              style={{
                boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.3)',
              }}
            >
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full"
                style={{
                  width: '100%', // Saldo real es 100% de sí mismo
                  boxShadow: '0 0 8px rgba(16, 185, 129, 0.6)',
                }}
              />
            </div>
            <div className="flex justify-between items-center mt-0.5 text-[9px] text-white/60">
              <span>Ingresos totales</span>
              <span>100%</span>
            </div>
          </div>

          {/* SALDO PROYECTADO */}
          <div>
            <div className="flex items-baseline justify-between mb-1">
              <span className="text-[10px] font-semibold text-white/70 tracking-wider">SALDO PROYECTADO</span>
              <span className="text-lg font-extrabold font-display">{formatCurrency(saldoProyectado)}</span>
            </div>
            {/* Barra horizontal con asignado y libre */}
            <div className="relative w-full h-1.5 bg-black/20 rounded-full overflow-hidden"
              style={{
                boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.3)',
              }}
            >
              {/* Parte asignada (rojo) */}
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-red-400 to-red-500 rounded-l-full"
                style={{
                  width: `${porcentajeAsignado}%`,
                }}
              />
              {/* Parte libre (azul) */}
              <div
                className="absolute inset-y-0 bg-gradient-to-r from-blue-400 to-blue-500 rounded-r-full"
                style={{
                  left: `${porcentajeAsignado}%`,
                  right: 0,
                  boxShadow: '0 0 8px rgba(59, 130, 246, 0.6)',
                }}
              />
            </div>
            <div className="flex justify-between items-center mt-0.5 text-[9px] text-white/60">
              <span>Asignado: {formatCurrency(asignado)} ({porcentajeAsignado}%)</span>
              <span>Libre: {100 - porcentajeAsignado}%</span>
            </div>
          </div>
        </div>

        {/* Wallet Bottom Edge (efecto 3D) */}
        <div
          className="h-1.5"
          style={{
            background: `linear-gradient(to bottom, ${adjustBrightness(bgColor, -30)}, ${adjustBrightness(bgColor, -40)})`,
            boxShadow: 'inset 0 1px 4px rgba(0,0,0,0.4)',
          }}
        />
      </div>
    </button>
  )
}

// Helper Functions
function getIconByType(tipo: string) {
  const icons: Record<string, any> = {
    DEBITO: CreditCard,
    CREDITO: CreditCard,
    EFECTIVO: Wallet,
    AHORRO: PiggyBank,
    INVERSION: TrendingUp,
  }
  return icons[tipo] || Wallet
}

function getColorByType(tipo: string): string {
  const colors: Record<string, string> = {
    DEBITO: '#3b82f6',    // blue-500
    CREDITO: '#ef4444',   // red-500
    EFECTIVO: '#10b981',  // green-500
    AHORRO: '#8b5cf6',    // purple-500
    INVERSION: '#f59e0b', // amber-500
  }
  return colors[tipo] || '#64748b'
}

function getTipoLabel(tipo: string): string {
  const labels: Record<string, string> = {
    DEBITO: 'DÉBITO',
    CREDITO: 'CRÉDITO',
    EFECTIVO: 'EFECTIVO',
    AHORRO: 'AHORRO',
    INVERSION: 'INVERSIÓN',
  }
  return labels[tipo] || tipo
}

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
