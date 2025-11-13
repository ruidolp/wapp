'use client'

import { useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface Billetera {
  id: string
  nombre: string
  emoji?: string
  moneda_principal_id?: string
}

interface Asignacion {
  billetera_id: string
  monto_asignado: number
  billetera?: Billetera
}

interface SobreCardProps {
  id: string
  nombre: string
  emoji?: string
  color?: string
  presupuestoAsignado: number
  gastado?: number
  asignaciones: Asignacion[]
  onAgregar?: () => void
  onDetalle?: () => void
  onDevolver?: () => void
}

export function SobreCard({
  id,
  nombre,
  emoji,
  color,
  presupuestoAsignado,
  gastado = 0,
  asignaciones,
  onAgregar,
  onDetalle,
  onDevolver,
}: SobreCardProps) {
  const presupuestoLibre = presupuestoAsignado - gastado
  const porcentajeGastado = presupuestoAsignado > 0 ? (gastado / presupuestoAsignado) * 100 : 0
  const isOverspent = gastado > presupuestoAsignado

  // Agrupar asignaciones por pares (2 billeteras por fila)
  const pares = useMemo(() => {
    const pairs = []
    for (let i = 0; i < asignaciones.length; i += 2) {
      pairs.push([asignaciones[i], asignaciones[i + 1]].filter(Boolean))
    }
    return pairs
  }, [asignaciones])

  const bgColor = color || '#3b82f6'

  return (
    <Card
      className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
      onClick={onDetalle}
    >
      {/* Header con color y emoji */}
      <div
        className="p-4 text-white flex items-center gap-3"
        style={{ backgroundColor: bgColor }}
      >
        <span className="text-3xl">{emoji || '📋'}</span>
        <div className="flex-1">
          <h3 className="font-bold text-lg">{nombre}</h3>
          <p className="text-sm opacity-90">
            ${presupuestoAsignado.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Contenido */}
      <div className="p-4 space-y-4">
        {/* Estado de gasto */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">
              Gastado: ${gastado.toFixed(2)}
            </span>
            <span className={`font-medium ${
              isOverspent ? 'text-red-600' : 'text-green-600'
            }`}>
              {isOverspent
                ? `Exceso: $${(gastado - presupuestoAsignado).toFixed(2)}`
                : `Libre: $${presupuestoLibre.toFixed(2)}`}
            </span>
          </div>
          <div className={`h-2 rounded-full overflow-hidden ${
            isOverspent ? 'bg-red-100' : 'bg-green-100'
          }`}>
            <div
              className={`h-full ${
                isOverspent ? 'bg-red-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(porcentajeGastado, 100)}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {porcentajeGastado.toFixed(1)}% del presupuesto
          </p>
        </div>

        {/* Asignaciones de billeteras - Grid 2 columnas */}
        {asignaciones.length > 0 ? (
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">
              Asignaciones ({asignaciones.length})
            </p>

            {pares.map((par, parIdx) => (
              <div key={parIdx} className="grid grid-cols-2 gap-2">
                {par.map((asignacion) => (
                  <div
                    key={asignacion.billetera_id}
                    className="p-2 rounded-lg border bg-slate-50 space-y-1"
                  >
                    <p className="text-xs font-medium truncate">
                      {asignacion.billetera?.emoji} {asignacion.billetera?.nombre}
                    </p>
                    <p className="text-sm font-bold">
                      ${asignacion.monto_asignado.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-3 rounded-lg bg-slate-50 text-center">
            <p className="text-sm text-muted-foreground">
              Sin asignaciones aún
            </p>
          </div>
        )}

        {/* Acciones */}
        <div className="grid grid-cols-3 gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onAgregar?.()
            }}
            className="text-xs"
          >
            Agregar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onDevolver?.()
            }}
            className="text-xs"
            disabled={presupuestoLibre <= 0}
          >
            Devolver
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onDetalle?.()
            }}
            className="text-xs"
          >
            Detalle
          </Button>
        </div>

        {/* Badge de overspend */}
        {isOverspent && (
          <Badge variant="destructive" className="w-full justify-center">
            ⚠️ Presupuesto excedido
          </Badge>
        )}
      </div>
    </Card>
  )
}
