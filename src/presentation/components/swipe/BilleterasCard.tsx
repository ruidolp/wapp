'use client'

import { Button } from '@/components/ui/button'
import { Plus, ArrowRightLeft } from 'lucide-react'
import type { Billetera, BilleteraConInfo } from '@/domain/types'

interface BilleterasCardProps {
  billeteras: Billetera[]
  onNuevaCuenta?: () => void
  onTransferir?: () => void
  onCrearSobre?: () => void
  onClickCuenta?: (billetera: Billetera) => void
}

export function BilleterasCard({
  billeteras,
  onNuevaCuenta,
  onTransferir,
  onCrearSobre,
  onClickCuenta,
}: BilleterasCardProps) {
  const billeterasSinInteres = billeteras.filter(b => b.tipo !== 'CREDITO')
  const billeterasConInteres = billeteras.filter(b => b.tipo === 'CREDITO')

  return (
    <div className="relative w-full h-full flex flex-col bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Wallet Shape Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10">
        <WalletShape />
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-sm border-b border-slate-200">
        <h2 className="text-xl font-bold text-slate-800">Billeteras</h2>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onNuevaCuenta}
            className="text-xs"
          >
            <Plus className="w-3 h-3 mr-1" />
            Nueva
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onTransferir}
            className="text-xs"
          >
            <ArrowRightLeft className="w-3 h-3 mr-1" />
            Transferir
          </Button>
        </div>
      </div>

      {/* Content - Scrollable */}
      <div className="relative z-10 flex-1 overflow-y-auto px-6 py-4">
        {/* Cuentas sin interés */}
        {billeterasSinInteres.length > 0 && (
          <div className="space-y-3 mb-6">
            {billeterasSinInteres.map(billetera => (
              <CuentaCard
                key={billetera.id}
                billetera={billetera}
                onClick={() => onClickCuenta?.(billetera)}
              />
            ))}
          </div>
        )}

        {/* Cuentas con interés */}
        {billeterasConInteres.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Con Interés
              </span>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
            </div>
            {billeterasConInteres.map(billetera => (
              <CuentaConInteresCard
                key={billetera.id}
                billetera={billetera}
                onClick={() => onClickCuenta?.(billetera)}
              />
            ))}
          </div>
        )}

        {billeteras.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="w-24 h-24 mb-4 rounded-full bg-slate-200 flex items-center justify-center">
              <Plus className="w-12 h-12 text-slate-400" />
            </div>
            <p className="text-slate-600 font-medium mb-2">No tienes cuentas</p>
            <p className="text-sm text-slate-500 mb-4">
              Crea tu primera cuenta para comenzar
            </p>
            <Button onClick={onNuevaCuenta}>
              <Plus className="w-4 h-4 mr-2" />
              Nueva Cuenta
            </Button>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      {billeteras.length > 0 && (
        <div className="relative z-10 px-6 py-4 bg-white/80 backdrop-blur-sm border-t border-slate-200">
          <div className="grid grid-cols-3 gap-2">
            <Button onClick={onNuevaCuenta} variant="outline" className="w-full text-xs">
              <Plus className="w-4 h-4 mr-1" />
              Cuenta
            </Button>
            <Button onClick={onCrearSobre} className="w-full text-xs">
              <Plus className="w-4 h-4 mr-1" />
              Sobre
            </Button>
            <Button onClick={onTransferir} variant="secondary" className="w-full text-xs">
              <ArrowRightLeft className="w-4 h-4 mr-1" />
              Transferir
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

// Cuenta normal (sin interés)
function CuentaCard({
  billetera,
  onClick,
}: {
  billetera: Billetera
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-white rounded-xl p-4 shadow-sm border border-slate-200 hover:shadow-md hover:border-slate-300 transition-all text-left"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-slate-700">
              {billetera.nombre}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {getTipoLabel(billetera.tipo)}
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-slate-900">
            {formatCurrency(billetera.saldo_real)}
          </p>
          <p className="text-xs text-slate-500">USD</p>
        </div>
      </div>
    </button>
  )
}

// Cuenta con interés (tarjeta de crédito)
function CuentaConInteresCard({
  billetera,
  onClick,
}: {
  billetera: Billetera
  onClick: () => void
}) {
  const saldoReal = billetera.saldo_real
  const saldoProyectado = billetera.saldo_proyectado
  const limiteCredito = 5000 // TODO: Obtener de configuración o campo dedicado

  // Calculate usage percentage
  const usagePercentage = limiteCredito > 0
    ? Math.abs((saldoReal / limiteCredito) * 100)
    : 0

  return (
    <button
      onClick={onClick}
      className="w-full bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 shadow-sm border-2 border-amber-200 hover:shadow-md hover:border-amber-300 transition-all text-left"
    >
      <div className="flex items-start gap-3">
        {/* Info */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-slate-800">
              {billetera.nombre}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-200 text-amber-800 font-medium">
              Crédito
            </span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-600">Saldo Real:</span>
              <span className="font-semibold text-slate-900">
                {formatCurrency(saldoReal)}
              </span>
            </div>
            {saldoProyectado !== saldoReal && (
              <div className="flex justify-between text-xs">
                <span className="text-slate-600">Proyectado:</span>
                <span className="font-semibold text-orange-700">
                  {formatCurrency(saldoProyectado)}
                </span>
              </div>
            )}
            {limiteCredito > 0 && (
              <div className="flex justify-between text-xs">
                <span className="text-slate-600">Límite:</span>
                <span className="font-semibold text-slate-700">
                  {formatCurrency(limiteCredito)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Mini Chart */}
        <div className="w-20 h-20 flex-shrink-0">
          <SaldoMiniChart
            saldoReal={saldoReal}
            saldoProyectado={saldoProyectado}
            limite={limiteCredito}
            percentage={usagePercentage}
          />
        </div>
      </div>
    </button>
  )
}

// Mini chart for real vs projected balance
function SaldoMiniChart({
  saldoReal,
  saldoProyectado,
  limite,
  percentage,
}: {
  saldoReal: number
  saldoProyectado: number
  limite: number
  percentage: number
}) {
  const realHeight = limite > 0 ? Math.min((Math.abs(saldoReal) / limite) * 100, 100) : 50
  const proyectadoHeight = limite > 0 ? Math.min((Math.abs(saldoProyectado) / limite) * 100, 100) : 50

  return (
    <div className="w-full h-full bg-white/50 rounded-lg p-2 flex items-end justify-center gap-2">
      {/* Real bar */}
      <div className="flex-1 flex flex-col items-center justify-end h-full">
        <div
          className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t transition-all"
          style={{ height: `${realHeight}%` }}
        />
        <span className="text-[8px] text-slate-600 mt-1">Real</span>
      </div>
      {/* Projected bar */}
      <div className="flex-1 flex flex-col items-center justify-end h-full">
        <div
          className="w-full bg-gradient-to-t from-orange-500 to-orange-400 rounded-t transition-all"
          style={{ height: `${proyectadoHeight}%` }}
        />
        <span className="text-[8px] text-slate-600 mt-1">Proy.</span>
      </div>
    </div>
  )
}

// Wallet SVG Shape
function WalletShape() {
  return (
    <svg
      viewBox="0 0 400 400"
      className="w-full h-full"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Wallet body */}
      <rect
        x="50"
        y="120"
        width="300"
        height="200"
        rx="15"
        fill="currentColor"
        className="text-slate-300"
      />
      {/* Wallet flap */}
      <path
        d="M 50 120 L 50 80 Q 50 60 70 60 L 330 60 Q 350 60 350 80 L 350 120"
        fill="currentColor"
        className="text-slate-400"
      />
      {/* Card slot */}
      <rect
        x="80"
        y="160"
        width="120"
        height="80"
        rx="8"
        fill="currentColor"
        className="text-slate-200"
        opacity="0.6"
      />
      {/* Buckle/clasp */}
      <circle
        cx="280"
        cy="200"
        r="25"
        fill="none"
        stroke="currentColor"
        strokeWidth="8"
        className="text-slate-400"
      />
    </svg>
  )
}

// Helpers
function getTipoLabel(tipo: string): string {
  const labels: Record<string, string> = {
    DEBITO: 'Débito',
    CREDITO: 'Crédito',
    EFECTIVO: 'Efectivo',
    AHORRO: 'Ahorro',
    INVERSION: 'Inversión',
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
