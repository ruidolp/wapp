'use client'

import { useState, useEffect } from 'react'
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
} from '@/components/ui/drawer'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { notify } from '@/infrastructure/lib/notifications'

interface CrearSobreDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
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

const EMOJIS_SUGERIDOS = ['🏠', '🍔', '🚗', '✈️', '🎮', '💊', '🎓', '🎁']

export function CrearSobreDrawer({
  open,
  onOpenChange,
  userId,
}: CrearSobreDrawerProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [existingSobres, setExistingSobres] = useState<string[]>([])

  const [nombre, setNombre] = useState('')
  const [presupuesto, setPresupuesto] = useState('')
  const [color, setColor] = useState(COLORES_SUGERIDOS[0])
  const [emoji, setEmoji] = useState(EMOJIS_SUGERIDOS[0])
  const [showColorPicker, setShowColorPicker] = useState(false)

  // Cargar sobres existentes para validar duplicados
  useEffect(() => {
    if (open) {
      fetchExistingSobres()
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

      const response = await fetch('/api/sobres', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          nombre: nombreTrimmed,
          tipo: 'GASTO', // Por defecto siempre GASTO
          presupuestoAsignado: parseFloat(presupuesto) || 0,
          color,
          emoji,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        // Manejar errores específicos
        if (data.requiresOnboarding) {
          notify.warning('Configuración requerida', data.error)
        } else {
          notify.error(data.error)
        }
        setLoading(false)
        return
      }

      // Éxito
      notify.created('Sobre')

      // Reset form
      setNombre('')
      setPresupuesto('')
      setColor(COLORES_SUGERIDOS[0])
      setEmoji(EMOJIS_SUGERIDOS[0])
      setShowColorPicker(false)

      // Close drawer
      onOpenChange(false)

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
            Segmenta tus gastos para orden y claridad en tus gastos, dentro de ellos puedes crear Categorías
          </DrawerDescription>
        </DrawerHeader>

        <form onSubmit={handleSubmit} className="px-4 space-y-4">
          {/* Nombre */}
          <div className="space-y-2">
            <Label htmlFor="nombre">
              Nombre <span className="text-red-500">*</span>
            </Label>
            <Input
              id="nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Hogar, Comida, Transporte"
              required
            />
          </div>

          {/* Presupuesto */}
          <div className="space-y-2">
            <Label htmlFor="presupuesto">
              Presupuesto Asignado <span className="text-red-500">*</span>
            </Label>
            <Input
              id="presupuesto"
              type="number"
              step="0.01"
              min="0"
              value={presupuesto}
              onChange={(e) => setPresupuesto(e.target.value)}
              placeholder="0"
              required
            />
          </div>

          {/* Emoji */}
          <div className="space-y-2">
            <Label>Icono</Label>
            <div className="flex gap-2 flex-wrap">
              {EMOJIS_SUGERIDOS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEmoji(e)}
                  className={`text-2xl w-12 h-12 rounded-lg border-2 transition-all ${
                    emoji === e
                      ? 'border-slate-900 bg-slate-100 scale-110'
                      : 'border-slate-300 hover:bg-slate-50 hover:scale-105'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
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
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="flex-1 font-mono text-sm"
                  />
                </div>
              </div>
            )}
          </div>

          <DrawerFooter className="px-0 pt-4 pb-2">
            <Button
              type="submit"
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
        </form>
      </DrawerContent>
    </Drawer>
  )
}
