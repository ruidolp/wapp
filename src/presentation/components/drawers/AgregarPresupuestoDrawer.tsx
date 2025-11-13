'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerBody,
} from '@/components/ui/drawer'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { notify } from '@/infrastructure/lib/notifications'
import { useInputFocus } from '@/presentation/hooks/useInputFocus'

interface Billetera {
  id: string
  nombre: string
  emoji?: string
  saldo_real: number
  moneda_principal_id: string
}

interface AgregarPresupuestoDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sobreId: string
  sobreName: string
  onSuccess?: () => void
}

export function AgregarPresupuestoDrawer({
  open,
  onOpenChange,
  sobreId,
  sobreName,
  onSuccess,
}: AgregarPresupuestoDrawerProps) {
  const [loading, setLoading] = useState(false)
  const [billeteras, setBilleteras] = useState<Billetera[]>([])
  const [billeteraSeleccionada, setBilleteraSeleccionada] = useState<string>('')
  const [monto, setMonto] = useState('')
  const [descripcion, setDescripcion] = useState('')

  const montoRef = useRef<HTMLInputElement>(null)
  useInputFocus(montoRef, 350)

  // Cargar billeteras disponibles
  useEffect(() => {
    if (open) {
      fetchBilleteras()
    }
  }, [open])

  const fetchBilleteras = async () => {
    try {
      const response = await fetch('/api/billeteras')
      if (response.ok) {
        const data = await response.json()
        setBilleteras(data.billeteras || [])
        if (data.billeteras && data.billeteras.length > 0) {
          setBilleteraSeleccionada(data.billeteras[0].id)
        }
      }
    } catch (error) {
      console.error('Error al cargar billeteras:', error)
      notify.error('Error al cargar billeteras')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const montoNum = parseFloat(monto)
      if (isNaN(montoNum) || montoNum <= 0) {
        notify.error('Monto debe ser mayor a 0')
        setLoading(false)
        return
      }

      const response = await fetch(`/api/sobres/${sobreId}/asignaciones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          billeteraId: billeteraSeleccionada,
          monto: montoNum,
          descripcion,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        notify.error(data.error || 'Error al agregar presupuesto')
        setLoading(false)
        return
      }

      notify.success(`Presupuesto agregado a ${sobreName}`)

      // Reset form
      setMonto('')
      setDescripcion('')

      // Close drawer
      onOpenChange(false)

      // Callback
      onSuccess?.()
    } catch (err: any) {
      notify.error(err.message || 'Error al agregar presupuesto')
    } finally {
      setLoading(false)
    }
  }

  const billeteraActual = billeteras.find((b) => b.id === billeteraSeleccionada)

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Agregar Presupuesto</DrawerTitle>
          <DrawerDescription>
            Asigna presupuesto a "{sobreName}" desde una billetera
          </DrawerDescription>
        </DrawerHeader>

        <DrawerBody>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Seleccionar billetera */}
            <div className="space-y-2">
              <Label htmlFor="billetera">
                Billetera <span className="text-red-500">*</span>
              </Label>
              <Select value={billeteraSeleccionada} onValueChange={setBilleteraSeleccionada}>
                <SelectTrigger id="billetera">
                  <SelectValue placeholder="Seleccionar billetera" />
                </SelectTrigger>
                <SelectContent>
                  {billeteras.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      <span className="mr-2">{b.emoji || '💳'}</span>
                      <span className="font-medium">{b.nombre}</span>
                      <span className="ml-2 text-xs text-muted-foreground">
                        ${Number(b.saldo_real || 0).toFixed(2)}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {billeteraActual && (
                <p className="text-xs text-muted-foreground">
                  Saldo disponible: ${Number(billeteraActual.saldo_real || 0).toFixed(2)}
                </p>
              )}
            </div>

            {/* Monto */}
            <div className="space-y-2">
              <Label htmlFor="monto">
                Monto <span className="text-red-500">*</span>
              </Label>
              <Input
                ref={montoRef}
                id="monto"
                type="number"
                step="0.01"
                min="0"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>

            {/* Descripción (opcional) */}
            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción (opcional)</Label>
              <Input
                id="descripcion"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Ej: Presupuesto inicial"
              />
            </div>
          </form>
        </DrawerBody>

        <DrawerFooter>
          <Button
            onClick={handleSubmit}
            disabled={loading || !billeteraSeleccionada || !monto}
            className="w-full"
          >
            {loading ? 'Agregando...' : 'Agregar Presupuesto'}
          </Button>
          <DrawerClose asChild>
            <Button variant="outline" disabled={loading} className="w-full mb-4">
              Cancelar
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
