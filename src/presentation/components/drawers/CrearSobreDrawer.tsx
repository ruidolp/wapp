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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { notify } from '@/infrastructure/lib/notifications'
import { useInputFocus } from '@/presentation/hooks/useInputFocus'

interface CrearSobreDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  onSobreCreated?: (sobre: any) => void
}

interface Billetera {
  id: string
  nombre: string
  emoji?: string
  moneda_principal_id: string
}

const COLORES_SUGERIDOS = [
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#06b6d4',
  '#64748b',
]

const TIPOS_BILLETERA = [
  { value: 'DEBITO', label: 'Débito' },
  { value: 'CREDITO', label: 'Crédito' },
  { value: 'EFECTIVO', label: 'Efectivo' },
  { value: 'AHORRO', label: 'Ahorro' },
  { value: 'INVERSION', label: 'Inversión' },
]

export function CrearSobreDrawer({
  open,
  onOpenChange,
  userId,
  onSobreCreated,
}: CrearSobreDrawerProps) {
  const router = useRouter()
  const [step, setStep] = useState<'billetera' | 'sobre'>('billetera')
  const [loading, setLoading] = useState(false)
  const [billeteras, setBilleteras] = useState<Billetera[]>([])
  const [creandoBilletera, setCreandoBilletera] = useState(false)

  // Billetera seleccionada/creada
  const [billeteraSeleccionada, setBilleteraSeleccionada] = useState<string>('')

  // Form para crear billetera
  const [billeteraNombre, setBilleteraNombre] = useState('')
  const [billeteraType, setBilleteraType] = useState('EFECTIVO')
  const [billeteraSaldo, setBilleteraSaldo] = useState('')

  // Form para crear sobre
  const [sobreName, setSobreName] = useState('')
  const [sobreColor, setSobreColor] = useState(COLORES_SUGERIDOS[0])
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [existingSobres, setExistingSobres] = useState<string[]>([])

  // Refs para focus
  const billeteraNombreRef = useRef<HTMLInputElement>(null)
  const billeteraSaldoRef = useRef<HTMLInputElement>(null)
  const sobreNombreRef = useRef<HTMLInputElement>(null)

  useInputFocus(billeteraNombreRef, 350)
  useInputFocus(billeteraSaldoRef, 350)
  useInputFocus(sobreNombreRef, 350)

  // Al abrir, cargar billeteras y sobres
  useEffect(() => {
    if (open) {
      setStep('billetera')
      setSobreName('')
      setSobreColor(COLORES_SUGERIDOS[0])
      setCreandoBilletera(false)
      setBilleteraNombre('')
      setBilleteraType('EFECTIVO')
      setBilleteraSaldo('')
      fetchBilleteras()
      fetchExistingSobres()
    }
  }, [open])

  const fetchBilleteras = async () => {
    try {
      const response = await fetch('/api/billeteras')
      if (response.ok) {
        const data = await response.json()
        const wallets = data.billeteras || []
        setBilleteras(wallets)
        if (wallets.length > 0) {
          setBilleteraSeleccionada(wallets[0].id)
        }
      }
    } catch (error) {
      console.error('Error al cargar billeteras:', error)
    }
  }

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

  const handleCrearBilletera = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const saldoInicial = parseFloat(billeteraSaldo) || 0

      const response = await fetch('/api/billeteras', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          nombre: billeteraNombre.trim(),
          tipo: billeteraType,
          saldoInicial,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        notify.error(data.error || 'Error al crear billetera')
        setLoading(false)
        return
      }

      notify.success('Billetera creada')

      // Establecer la nueva billetera como seleccionada
      setBilleteraSeleccionada(data.billetera.id)

      // Agregar a la lista
      setBilleteras([...billeteras, data.billetera])

      // Resetear form y pasar al siguiente paso
      setBilleteraNombre('')
      setBilleteraType('EFECTIVO')
      setBilleteraSaldo('')
      setCreandoBilletera(false)
      setStep('sobre')

      setLoading(false)
    } catch (err: any) {
      notify.error(err.message || 'Error al crear billetera')
      setLoading(false)
    }
  }

  const handleCrearSobre = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const nombreTrimmed = sobreName.trim()

      // Validar duplicado
      if (existingSobres.includes(nombreTrimmed.toLowerCase())) {
        notify.duplicate('sobre', 'nombre')
        setLoading(false)
        return
      }

      // Crear el sobre
      const response = await fetch('/api/sobres', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          nombre: nombreTrimmed,
          tipo: 'GASTO',
          presupuestoAsignado: 0,
          color: sobreColor,
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

      // Reset
      setSobreName('')
      setSobreColor(COLORES_SUGERIDOS[0])
      setShowColorPicker(false)
      setStep('billetera')
      setBilleteraSeleccionada('')

      // Close drawer
      onOpenChange(false)

      // Callback
      onSobreCreated?.(data.sobre)

      // Refresh page
      router.refresh()
    } catch (err: any) {
      notify.error(err.message || 'Error al crear el sobre')
    } finally {
      setLoading(false)
    }
  }

  const handleContinueSobre = () => {
    if (!billeteraSeleccionada) {
      notify.error('Debes seleccionar o crear una billetera')
      return
    }
    setStep('sobre')
  }

  const handleBackToBilletera = () => {
    setCreandoBilletera(false)
    setStep('billetera')
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Crear Nuevo Sobre</DrawerTitle>
          <DrawerDescription>
            {step === 'billetera'
              ? 'Selecciona o crea una billetera para tu sobre'
              : 'Define el nombre y color de tu sobre'}
          </DrawerDescription>
        </DrawerHeader>

        <DrawerBody>
          {/* PASO 1: BILLETERA */}
          {step === 'billetera' && !creandoBilletera && (
            <div className="space-y-4">
              {billeteras.length === 0 ? (
                <Alert variant="destructive">
                  <AlertDescription>
                    <p className="font-semibold mb-2">No tienes billeteras creadas</p>
                    <p className="text-sm mb-3">
                      Necesitas crear una billetera para poder crear un sobre.
                    </p>
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="billetera-select">
                    Selecciona tu billetera
                  </Label>
                  <Select value={billeteraSeleccionada} onValueChange={setBilleteraSeleccionada}>
                    <SelectTrigger id="billetera-select">
                      <SelectValue placeholder="Seleccionar billetera" />
                    </SelectTrigger>
                    <SelectContent>
                      {billeteras.map((b) => (
                        <SelectItem key={b.id} value={b.id}>
                          <span className="font-medium">{b.nombre}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <button
                type="button"
                onClick={() => setCreandoBilletera(true)}
                className="text-sm text-blue-600 hover:text-blue-700 underline mt-4"
              >
                {billeteras.length === 0
                  ? '✨ Crear mi primera billetera'
                  : '+ Crear nueva billetera'}
              </button>
            </div>
          )}

          {/* PASO 1B: CREAR BILLETERA INLINE */}
          {step === 'billetera' && creandoBilletera && (
            <form onSubmit={handleCrearBilletera} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nombre-billetera">
                  Nombre <span className="text-red-500">*</span>
                </Label>
                <Input
                  ref={billeteraNombreRef}
                  id="nombre-billetera"
                  value={billeteraNombre}
                  onChange={(e) => setBilleteraNombre(e.target.value)}
                  placeholder="Ej: Mi Tarjeta, Efectivo"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipo-billetera">
                  Tipo <span className="text-red-500">*</span>
                </Label>
                <Select value={billeteraType} onValueChange={setBilleteraType}>
                  <SelectTrigger id="tipo-billetera">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIPOS_BILLETERA.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="saldo-billetera">
                  Saldo Inicial <span className="text-red-500">*</span>
                </Label>
                <Input
                  ref={billeteraSaldoRef}
                  id="saldo-billetera"
                  type="number"
                  step="0.01"
                  min="0"
                  value={billeteraSaldo}
                  onChange={(e) => setBilleteraSaldo(e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="submit"
                  disabled={loading || !billeteraNombre.trim()}
                  className="flex-1"
                >
                  {loading ? 'Creando...' : 'Crear Billetera'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBackToBilletera}
                  disabled={loading}
                  className="flex-1"
                >
                  Atrás
                </Button>
              </div>
            </form>
          )}

          {/* PASO 2: CREAR SOBRE */}
          {step === 'sobre' && (
            <form onSubmit={handleCrearSobre} className="space-y-4">
              {/* Nombre */}
              <div className="space-y-2">
                <Label htmlFor="nombre-sobre">
                  Nombre <span className="text-red-500">*</span>
                </Label>
                <Input
                  ref={sobreNombreRef}
                  id="nombre-sobre"
                  value={sobreName}
                  onChange={(e) => setSobreName(e.target.value)}
                  placeholder="Ej: Comida, Transporte, Hogar"
                  required
                />
              </div>

              {/* Color */}
              <div className="space-y-2">
                <Label>Color</Label>
                <div className="flex gap-2 flex-wrap items-center">
                  {COLORES_SUGERIDOS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => {
                        setSobreColor(c)
                        setShowColorPicker(false)
                      }}
                      className={`w-10 h-10 rounded-full border-2 transition-all ${
                        sobreColor === c && !showColorPicker
                          ? 'border-slate-900 scale-110'
                          : 'border-slate-300 hover:scale-105'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}

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

                {showColorPicker && (
                  <div className="mt-3 p-3 border border-slate-300 rounded-lg bg-white">
                    <HexColorPicker color={sobreColor} onChange={setSobreColor} />
                    <div className="mt-3 flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded border border-slate-300"
                        style={{ backgroundColor: sobreColor }}
                      />
                      <Input
                        type="text"
                        value={sobreColor}
                        onChange={(e) => setSobreColor(e.target.value)}
                        className="flex-1 font-mono text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>
            </form>
          )}
        </DrawerBody>

        {/* FOOTERS */}
        <DrawerFooter>
          {step === 'billetera' && !creandoBilletera && (
            <>
              <Button
                onClick={handleContinueSobre}
                disabled={loading || !billeteraSeleccionada}
                className="w-full"
              >
                Continuar
              </Button>
              <DrawerClose asChild>
                <Button variant="outline" disabled={loading} className="w-full mb-4">
                  Cancelar
                </Button>
              </DrawerClose>
            </>
          )}

          {step === 'sobre' && (
            <>
              <Button
                onClick={handleCrearSobre}
                disabled={loading || !sobreName.trim()}
                className="w-full"
              >
                {loading ? 'Creando...' : 'Crear Sobre'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep('billetera')}
                disabled={loading}
                className="w-full mb-4"
              >
                Atrás
              </Button>
            </>
          )}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
