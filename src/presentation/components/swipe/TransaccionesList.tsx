'use client'

import { useMemo } from 'react'
import { ArrowDownLeft, ArrowUpRight, ArrowRightLeft } from 'lucide-react'
import type { Transaccion } from '@/domain/types'

interface TransaccionesListProps {
  transacciones: Transaccion[]
}

interface TransaccionPorDia {
  fecha: string
  transacciones: Transaccion[]
}

export function TransaccionesList({ transacciones }: TransaccionesListProps) {
  const transaccionesPorDia = useMemo(() => {
    const grupos: Record<string, Transaccion[]> = {}

    transacciones.forEach(trx => {
      const fecha = trx.fecha.toLocaleDateString('es-PA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })

      if (!grupos[fecha]) {
        grupos[fecha] = []
      }
      grupos[fecha].push(trx)
    })

    return Object.entries(grupos)
      .map(([fecha, trxs]) => ({
        fecha,
        transacciones: trxs.sort(
          (a, b) => b.fecha.getTime() - a.fecha.getTime()
        ),
      }))
      .sort((a, b) => {
        const dateA = a.transacciones[0].fecha.getTime()
        const dateB = b.transacciones[0].fecha.getTime()
        return dateB - dateA
      })
  }, [transacciones])

  if (transacciones.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        <p className="text-sm">No hay transacciones registradas</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {transaccionesPorDia.map(grupo => (
        <div key={grupo.fecha}>
          {/* Date header */}
          <div className="sticky top-0 bg-slate-100/90 backdrop-blur-sm px-4 py-2 mb-2 rounded-lg">
            <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              {grupo.fecha}
            </h3>
          </div>

          {/* Transactions for this day */}
          <div className="space-y-2">
            {grupo.transacciones.map(trx => (
              <TransaccionItem key={trx.id} transaccion={trx} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function TransaccionItem({ transaccion }: { transaccion: Transaccion }) {
  const isIngreso = transaccion.tipo === 'INGRESO'
  const isGasto = transaccion.tipo === 'GASTO'
  const isTransferencia = transaccion.tipo === 'TRANSFERENCIA'

  const Icon = isIngreso
    ? ArrowDownLeft
    : isGasto
    ? ArrowUpRight
    : ArrowRightLeft

  const iconColor = isIngreso
    ? 'text-green-600 bg-green-100'
    : isGasto
    ? 'text-red-600 bg-red-100'
    : 'text-blue-600 bg-blue-100'

  const amountColor = isIngreso
    ? 'text-green-700'
    : isGasto
    ? 'text-red-700'
    : 'text-blue-700'

  return (
    <div className="flex items-center gap-3 bg-white rounded-lg p-3 shadow-sm border border-slate-200">
      {/* Icon */}
      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${iconColor}`}>
        <Icon className="w-5 h-5" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-900 truncate">
          {transaccion.descripcion || 'Sin descripción'}
        </p>
        <p className="text-xs text-slate-500">
          {transaccion.fecha.toLocaleTimeString('es-PA', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>

      {/* Amount */}
      <div className="text-right flex-shrink-0">
        <p className={`text-sm font-bold ${amountColor}`}>
          {isIngreso ? '+' : isGasto ? '-' : ''}
          {formatCurrency(Math.abs(transaccion.monto))}
        </p>
        <p className="text-xs text-slate-500">USD</p>
      </div>
    </div>
  )
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-PA', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount)
}
