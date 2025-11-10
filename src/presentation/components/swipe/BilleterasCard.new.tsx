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
      <div className="w-full h-full flex items-center justify-center p-8 bg-background">
        <div className="text-center space-y-4">
          <div className="w-24 h-24 mx-auto rounded-full bg-muted flex items-center justify-center shadow-inner">
            <Wallet className="w-12 h-12 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground font-display mb-2">
              Sin billeteras
            </h3>
            <p className="text-sm text-muted-foreground">
              Crea tu primera cuenta para comenzar
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full flex flex-col bg-background">
      {/* Balance Total - Con colores del theme */}
      <div className="px-3 pt-3 pb-2">
        <div
          className="bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] rounded-2xl p-3.5 transform hover:scale-[1.01] transition-transform"
          style={{
            boxShadow: '0 10px 35px hsl(var(--primary) / 0.3), 0 0 25px hsl(var(--accent) / 0.2)',
          }}
        >
          <div className="flex items-center justify-between text-primary-foreground/80 mb-1">
            <span className="text-xs font-semibold tracking-wide">BALANCE TOTAL</span>
            <DollarSign className="w-4 h-4" />
          </div>
          <p className="text-3xl font-extrabold text-primary-foreground font-display tracking-tight">
            {formatCurrency(totalReal)}
          </p>
          <div className="flex items-center justify-between mt-2 text-xs text-primary-foreground/60">
            <span>{billeteras.length} {billeteras.length === 1 ? 'cuenta' : 'cuentas'}</span>
            <span>Proyectado: {formatCurrency(totalProyectado)}</span>
          </div>
        </div>
      </div>

      {/* Billeteras List - Scrollable */}
      <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-2.5">
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

// Wallet Card - Usa color custom solo en tarjeta, resto theme
function WalletCard({
  billetera,
  onClick,
}: {
  billetera: Billetera
  onClick: () => void
}) {
  const customColor = billetera.color || getColorByType(billetera.tipo)
  const Icon = getIconByType(billetera.tipo)

  // Dummy data: Asumimos que 60% está asignado a sobres
  const saldoReal = billetera.saldo_real
  const saldoProyectado = saldoReal * 0.4
  const asignado = saldoReal * 0.6
  const porcentajeAsignado = 60 // 60% asignado, 40% libre

  return (
    <button
      onClick={onClick}
      className="w-full group relative"
      style={{
        perspective: '1000px',
      }}
    >
      {/* Shadow Halo con color del theme */}
      <div
        className="absolute -inset-1 rounded-2xl blur-2xl opacity-30 group-hover:opacity-50 transition-opacity"
        style={{
          backgroundColor: customColor,
          boxShadow: `0 0 35px hsl(var(--primary) / 0.2)`,
        }}
      />

      {/* Wallet Container - color custom */}
      <div
        className="relative rounded-2xl overflow-hidden transform transition-all duration-300 group-hover:scale-[1.02] group-hover:-translate-y-0.5"
        style={{
          transformStyle: 'preserve-3d',
          boxShadow: `0 8px 25px ${customColor}40`,
        }}
      >
        {/* Main Wallet Content - Compacto */}
        <div
          className="relative px-3 py-2.5 text-white"
          style={{
            background: `linear-gradient(135deg, ${customColor} 0%, ${adjustBrightness(customColor, -20)} 100%)`,
          }}
        >
          {/* Top Row: Icon - Nombre - Tipo */}
          <div className="flex items-center justify-between gap-2 mb-2">
            {/* Emoji/Icon */}
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0"
              style={{
                boxShadow: '0 3px 10px rgba(0,0,0,0.15)',
              }}
            >
              {billetera.emoji ? (
                <span className="text-lg">{billetera.emoji}</span>
              ) : (
                <Icon className="w-4 h-4 text-white" />
              )}
            </div>

            {/* Nombre (centro) */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold font-display text-center truncate">
                {billetera.nombre}
              </p>
            </div>

            {/* Tipo Badge */}
            <div className="px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm flex-shrink-0">
              <span className="text-[9px] font-bold tracking-wider">
                {getTipoLabel(billetera.tipo)}
              </span>
            </div>
          </div>

          {/* SALDO REAL */}
          <div className="mb-2">
            <div className="flex items-baseline justify-between mb-0.5">
              <span className="text-[9px] font-semibold text-white/70 tracking-wider">SALDO REAL</span>
              <span className="text-base font-extrabold font-display">{formatCurrency(saldoReal)}</span>
            </div>
            {/* Barra horizontal */}
            <div className="relative w-full h-1.5 bg-black/20 rounded-full overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full"
                style={{
                  width: '100%',
                  boxShadow: '0 0 8px rgba(16, 185, 129, 0.6)',
                }}
              />
            </div>
            <div className="flex justify-between items-center mt-0.5 text-[8px] text-white/60">
              <span>Ingresos totales</span>
              <span>100%</span>
            </div>
          </div>

          {/* SALDO PROYECTADO */}
          <div>
            <div className="flex items-baseline justify-between mb-0.5">
              <span className="text-[9px] font-semibold text-white/70 tracking-wider">SALDO PROYECTADO</span>
              <span className="text-base font-extrabold font-display">{formatCurrency(saldoProyectado)}</span>
            </div>
            {/* Barra horizontal con asignado y libre */}
            <div className="relative w-full h-1.5 bg-black/20 rounded-full overflow-hidden">
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
            <div className="flex justify-between items-center mt-0.5 text-[8px] text-white/60">
              <span>Asignado: {formatCurrency(asignado)} ({porcentajeAsignado}%)</span>
              <span>Libre: {100 - porcentajeAsignado}%</span>
            </div>
          </div>
        </div>

        {/* Wallet Bottom Edge */}
        <div
          className="h-1"
          style={{
            background: `linear-gradient(to bottom, ${adjustBrightness(customColor, -30)}, ${adjustBrightness(customColor, -40)})`,
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
    DEBITO: '#3b82f6',
    CREDITO: '#ef4444',
    EFECTIVO: '#10b981',
    AHORRO: '#8b5cf6',
    INVERSION: '#f59e0b',
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
