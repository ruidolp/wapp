'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { HexColorPicker } from 'react-colorful'
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
import { Alert, AlertDescription } from '@/components/ui/alert'
import { notify } from '@/infrastructure/lib/notifications'
import { useInputFocus } from '@/presentation/hooks/useInputFocus'

interface CrearSobreDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  onSobreCreated?: (sobre: any) => void
}

const COLORES_SUGERIDOS = [
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#06b6d4', // cyan
  '#64748b', // slate
]

export function CrearSobreDrawer({
  open,
  onOpenChange,
  userId,
  onSobreCreated,
}: CrearSobreDrawerProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [existingSobres, setExistingSobres] = useState<string[]>([])
  const [billeteras, setBilleteras] = useState<any[]>([])
  const [hasNoBilleteras, setHasNoBilleteras] = useState(false)

  const [nombre, setNombre] = useState('')
  const [color, setColor] = useState(COLORES_SUGERIDOS[0])
  const [showColorPicker, setShowColorPicker] = useState(false)

  // Refs for input focus
  const nombreRef = useRef<HTMLInputElement>(null)
  const colorHexRef = useRef<HTMLInputElement>(null)

  // Focus handlers
  useInputFocus(nombreRef, 350)
  useInputFocus(colorHexRef, 350)

  // Cargar datos al abrir
  useEffect(() => {
    if (open) {
      fetchExistingSobres()
      fetchBilleteras()
    }
  }, [open])

  const fetchExistingSobres = async () => {
    try {
      const response = await fetch('/api/sobres')
      if (response.ok) {
        const data = await response.json()
        const nombres = data.sobres.map((s: any) => s.nombre.toLowerCase().trim())
        setExistingSobres(nombres)
      }
    } catch (error) {
      console.error('Error al cargar sobres:', error)
    }
  }

  const fetchBilleteras = async () => {
    try {
      const response = await fetch('/api/billeteras')
      if (response.ok) {
        const data = await response.json()
        const wallets = data.billeteras || []
        setBilleteras(wallets)
        setHasNoBilleteras(wallets.length === 0)
      }
    } catch (error) {
      console.error('Error al cargar billeteras:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const nombreTrimmed = nombre.trim()

      // Validar duplicado
      if (existingSobres.includes(nombreTrimmed.toLowerCase())) {
        notify.duplicate('sobre', 'nombre')
        setLoading(false)
        return
      }

      // Crear el sobre (sin presupuesto inicialmente)
      const response = await fetch('/api/sobres', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          nombre: nombreTrimmed,
          tipo: 'GASTO',
          presupuestoAsignado: 0, // Sin presupuesto inicial
          color,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.requiresOnboarding) {
          notify.warning('Configuración requerida', data.error)
        } else {
          notify.error(data.error)
        }
        setLoading(false)
        return
      }

      notify.created('Sobre')

      // Reset form
      setNombre('')
      setColor(COLORES_SUGERIDOS[0])
      setShowColorPicker(false)

      // Close drawer
      onOpenChange(false)

      // Callback - pasar el sobre creado para abrir AgregarPresupuestoDrawer
      onSobreCreated?.(data.sobre)

      // Refresh page
      router.refresh()
    } catch (err: any) {
      notify.error(err.message || 'Error al crear el sobre')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Crear Nuevo Sobre</DrawerTitle>
          <DrawerDescription>
            Define el nombre y color de tu sobre. El presupuesto se asigna después desde tus billeteras.
          </DrawerDescription>
        </DrawerHeader>

        {/* Warning si no hay billeteras */}
        {hasNoBilleteras && (
          <DrawerBody>
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>
                <p className="font-semibold mb-2">⚠️ No tienes billeteras creadas</p>
                <p className="text-sm mb-3">
                  Necesitas crear una billetera antes de poder asignar presupuesto a un sobre.
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    onOpenChange(false)
                    // TODO: Navegar a crear billetera
                  }}
                >
                  Crear billetera primero
                </Button>
              </AlertDescription>
            </Alert>
          </DrawerBody>
        )}

        {!hasNoBilleteras && (
          <DrawerBody>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nombre */}
              <div className="space-y-2">
                <Label htmlFor="nombre">
                  Nombre <span className="text-red-500">*</span>
                </Label>
                <Input
                  ref={nombreRef}
                  id="nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej: Comida, Transporte, Hogar"
                  required
                />
              </div>

              {/* Color */}
              <div className="space-y-2">
                <Label>Color</Label>

                {/* Colores predefinidos */}
                <div className="flex gap-2 flex-wrap items-center">
                  {COLORES_SUGERIDOS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => {
                        setColor(c)
                        setShowColorPicker(false)
                      }}
                      className={`w-10 h-10 rounded-full border-2 transition-all ${
                        color === c && !showColorPicker
                          ? 'border-slate-900 scale-110'
                          : 'border-slate-300 hover:scale-105'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}

                  {/* Botón para abrir selector personalizado */}
                  <button
                    type="button"
                    onClick={() => setShowColorPicker(!showColorPicker)}
                    className={`w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center text-xs font-bold ${
                      showColorPicker
                        ? 'border-slate-900 bg-slate-100'
                        : 'border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    +
                  </button>
                </div>

                {/* Color Picker */}
                {showColorPicker && (
                  <div className="mt-3 p-3 border border-slate-300 rounded-lg bg-white">
                    <HexColorPicker color={color} onChange={setColor} />
                    <div className="mt-3 flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded border border-slate-300"
                        style={{ backgroundColor: color }}
                      />
                      <Input
                        ref={colorHexRef}
                        type="text"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className="flex-1 font-mono text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>
            </form>
          </DrawerBody>
        )}

        {!hasNoBilleteras && (
          <DrawerFooter>
            <Button
              onClick={handleSubmit}
              disabled={loading || !nombre.trim()}
              className="w-full"
            >
              {loading ? 'Creando...' : 'Crear Sobre'}
            </Button>
            <DrawerClose asChild>
              <Button variant="outline" disabled={loading} className="w-full mb-4">
                Cancelar
              </Button>
            </DrawerClose>
          </DrawerFooter>
        )}
      </DrawerContent>
    </Drawer>
  )
}
