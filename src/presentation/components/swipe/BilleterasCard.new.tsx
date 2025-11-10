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
  const totalBalance = billeteras.reduce((sum, b) => sum + b.saldo_real, 0)

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
      {/* Balance Total */}
      <div className="px-6 pt-6 pb-4">
        <div className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl p-6 shadow-2xl transform hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-white/80 mb-2">
            <span className="text-sm font-medium">Balance Total</span>
            <DollarSign className="w-5 h-5" />
          </div>
          <p className="text-4xl font-extrabold text-white font-display tracking-tight">
            {formatCurrency(totalBalance)}
          </p>
          <p className="text-xs text-white/60 mt-1">
            {billeteras.length} {billeteras.length === 1 ? 'cuenta' : 'cuentas'}
          </p>
        </div>
      </div>

      {/* Billeteras List - Scrollable */}
      <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-4">
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

// Wallet Card - Cada cuenta como una billetera individual
function WalletCard({
  billetera,
  onClick,
}: {
  billetera: Billetera
  onClick: () => void
}) {
  const bgColor = billetera.color || getColorByType(billetera.tipo)
  const Icon = getIconByType(billetera.tipo)

  return (
    <button
      onClick={onClick}
      className="w-[calc(100%-1rem)] mx-2 group relative"
      style={{
        perspective: '1000px',
      }}
    >
      {/* Shadow Layer (profundidad) */}
      <div
        className="absolute -inset-1 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity"
        style={{ backgroundColor: bgColor }}
      />

      {/* Wallet Container */}
      <div
        className="relative rounded-2xl overflow-hidden transform transition-all duration-300 group-hover:scale-[1.02] group-hover:-translate-y-1"
        style={{
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Wallet Back (fondo con textura) */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.03) 10px, rgba(0,0,0,0.03) 20px)
            `,
          }}
        />

        {/* Main Wallet Content */}
        <div
          className="relative px-5 py-4 text-white"
          style={{
            background: `linear-gradient(135deg, ${bgColor} 0%, ${adjustBrightness(bgColor, -20)} 100%)`,
          }}
        >
          {/* Top Row */}
          <div className="flex items-start justify-between mb-6">
            {/* Emoji/Icon */}
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
              {billetera.emoji ? (
                <span className="text-2xl">{billetera.emoji}</span>
              ) : (
                <Icon className="w-6 h-6 text-white" />
              )}
            </div>

            {/* Tipo Badge */}
            <div className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm">
              <span className="text-xs font-semibold tracking-wide">
                {getTipoLabel(billetera.tipo)}
              </span>
            </div>
          </div>

          {/* Balance */}
          <div className="mb-3">
            <p className="text-sm font-medium text-white/80 mb-1">
              {billetera.nombre}
            </p>
            <p className="text-3xl font-extrabold font-display tracking-tight">
              {formatCurrency(billetera.saldo_real)}
            </p>
          </div>

          {/* Card Number Effect (decorativo) */}
          <div className="flex gap-3 opacity-60">
            <div className="flex gap-1">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-2 h-2 rounded-full bg-white/60" />
              ))}
            </div>
            <div className="flex gap-1">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-2 h-2 rounded-full bg-white/60" />
              ))}
            </div>
            <div className="flex gap-1">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-2 h-2 rounded-full bg-white/60" />
              ))}
            </div>
          </div>
        </div>

        {/* Wallet Bottom Edge (efecto 3D) */}
        <div
          className="h-2"
          style={{
            background: `linear-gradient(to bottom, ${adjustBrightness(bgColor, -30)}, ${adjustBrightness(bgColor, -40)})`,
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
    minimumFractionDigits: 2,
  }).format(amount)
}

function adjustBrightness(hex: string, percent: number): string {
  // Remove # if present
  hex = hex.replace(/^#/, '')

  // Parse r, g, b values
  let r = parseInt(hex.substring(0, 2), 16)
  let g = parseInt(hex.substring(2, 4), 16)
  let b = parseInt(hex.substring(4, 6), 16)

  // Adjust brightness
  r = Math.max(0, Math.min(255, r + (r * percent) / 100))
  g = Math.max(0, Math.min(255, g + (g * percent) / 100))
  b = Math.max(0, Math.min(255, b + (b * percent) / 100))

  // Convert back to hex
  const toHex = (n: number) => Math.round(n).toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}
