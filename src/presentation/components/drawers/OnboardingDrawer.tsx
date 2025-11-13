'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface OnboardingDrawerProps {
  open: boolean
  onOpenChange?: (open: boolean) => void
}

interface Moneda {
  id: string
  codigo: string
  nombre: string
  simbolo: string
}

const TIMEZONES = [
  { value: 'America/Santiago', label: 'Santiago (GMT-3)' },
  { value: 'America/New_York', label: 'New York (GMT-5)' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (GMT-8)' },
  { value: 'America/Mexico_City', label: 'Ciudad de México (GMT-6)' },
  { value: 'America/Sao_Paulo', label: 'São Paulo (GMT-3)' },
  { value: 'Europe/Madrid', label: 'Madrid (GMT+1)' },
  { value: 'Europe/London', label: 'Londres (GMT+0)' },
]

const PRIMER_DIA_SEMANA = [
  { value: '0', label: 'Domingo' },
  { value: '1', label: 'Lunes' },
]

export function OnboardingDrawer({ open, onOpenChange }: OnboardingDrawerProps) {
  const router = useRouter()
  const [monedas, setMonedas] = useState<Moneda[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingMonedas, setLoadingMonedas] = useState(true)

  // Formulario
  const [monedaSeleccionada, setMonedaSeleccionada] = useState('')
  const [timezone, setTimezone] = useState('America/Santiago')
  const [primerDiaSemana, setPrimerDiaSemana] = useState('1')

  // Detectar locale del navegador
  const [locale, setLocale] = useState('es-CL')

  // Note: Select components don't need useInputFocus as they open as dropdowns
  // and don't push content off screen like text inputs do on mobile

  useEffect(() => {
    // Detectar locale automáticamente
    const detectedLocale = navigator.language || 'es-CL'
    setLocale(detectedLocale)

    // Detectar timezone automáticamente
    const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    if (detectedTimezone) {
      setTimezone(detectedTimezone)
    }
  }, [])

  // Cargar monedas
  useEffect(() => {
    async function loadMonedas() {
      try {
        const response = await fetch('/api/monedas')
        const data = await response.json()
        if (data.success) {
          setMonedas(data.monedas)
          // Seleccionar CLP por defecto si existe
          const clp = data.monedas.find((m: Moneda) => m.codigo === 'CLP')
          if (clp) {
            setMonedaSeleccionada(clp.id)
          }
        }
      } catch (error) {
        console.error('Error al cargar monedas:', error)
      } finally {
        setLoadingMonedas(false)
      }
    }
    loadMonedas()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/user/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          monedaPrincipalId: monedaSeleccionada,
          timezone,
          locale,
          primerDiaSemana: parseInt(primerDiaSemana),
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Cerrar drawer y refrescar la página
        onOpenChange?.(false)
        router.refresh()
      } else {
        alert(data.error || 'Error al guardar configuración')
      }
    } catch (error) {
      console.error('Error al guardar configuración:', error)
      alert('Error al guardar configuración')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange} dismissible={false}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className="text-2xl">¡Bienvenido! 👋</DrawerTitle>
          <DrawerDescription>
            Para comenzar, necesitamos configurar algunas preferencias básicas
          </DrawerDescription>
        </DrawerHeader>

        <DrawerBody>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Moneda Principal */}
            <div className="space-y-2">
              <Label htmlFor="moneda" className="text-base font-medium">
                Moneda Principal <span className="text-red-500">*</span>
              </Label>
              <Select
                value={monedaSeleccionada}
                onValueChange={setMonedaSeleccionada}
                disabled={loadingMonedas}
              >
                <SelectTrigger id="moneda">
                  <SelectValue placeholder="Selecciona tu moneda" />
                </SelectTrigger>
                <SelectContent>
                  {monedas.map((moneda) => (
                    <SelectItem key={moneda.id} value={moneda.id}>
                      {moneda.simbolo} {moneda.codigo} - {moneda.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Esta será la moneda que usarás para tus billeteras y sobres
              </p>
            </div>

            {/* Timezone */}
            <div className="space-y-2">
              <Label htmlFor="timezone" className="text-base font-medium">
                Zona Horaria
              </Label>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger id="timezone">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONES.map((tz) => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Primer Día de la Semana */}
            <div className="space-y-2">
              <Label htmlFor="primer-dia" className="text-base font-medium">
                Primer día de la semana
              </Label>
              <Select value={primerDiaSemana} onValueChange={setPrimerDiaSemana}>
                <SelectTrigger id="primer-dia">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIMER_DIA_SEMANA.map((dia) => (
                    <SelectItem key={dia.value} value={dia.value}>
                      {dia.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </form>
        </DrawerBody>

        <DrawerFooter>
          <Button
            onClick={handleSubmit}
            className="w-full"
            disabled={loading || !monedaSeleccionada}
          >
            {loading ? 'Guardando...' : 'Comenzar'}
          </Button>
          <p className="text-xs text-center text-muted-foreground mt-2">
            Podrás cambiar estas preferencias más adelante
          </p>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
