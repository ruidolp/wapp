'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
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
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { notify } from '@/infrastructure/lib/notifications'
import { useInputFocus } from '@/presentation/hooks/useInputFocus'
import { useCrearGasto } from '@/presentation/hooks/useTransacciones'

interface Sobre {
  id: string
  nombre: string
  emoji?: string
  color?: string
}

interface Billetera {
  id: string
  nombre: string
  emoji?: string
  saldo_real: number
  moneda_principal_id: string
}

interface Categoria {
  id: string
  nombre: string
  emoji?: string
  color?: string
}

interface Subcategoria {
  id: string
  nombre: string
  emoji?: string
  categoria_id: string
}

interface CrearGastoDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  preselectedSobreId?: string
  preselectedCategoriaId?: string
  onSuccess?: () => void
}

export function CrearGastoDrawer({
  open,
  onOpenChange,
  userId,
  preselectedSobreId,
  preselectedCategoriaId,
  onSuccess,
}: CrearGastoDrawerProps) {
  const [loading, setLoading] = useState(false)
  const [sobres, setSobres] = useState<Sobre[]>([])
  const [billeteras, setBilleteras] = useState<Billetera[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [subcategorias, setSubcategorias] = useState<Subcategoria[]>([])

  const [sobreSeleccionado, setSobreSeleccionado] = useState<string>('')
  const [billeteraSeleccionada, setBilleteraSeleccionada] = useState<string>('')
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>('')
  const [subcategoriaSeleccionada, setSubcategoriaSeleccionada] = useState<string>('')
  const [monto, setMonto] = useState('')
  const [comentario, setComentario] = useState('')

  const montoRef = useRef<HTMLInputElement>(null)
  useInputFocus(montoRef, 350)

  const { crearGasto } = useCrearGasto()

  // Cargar datos cuando se abre el drawer
  useEffect(() => {
    if (open) {
      fetchData()
      // Reset preselected fields
      setSobreSeleccionado(preselectedSobreId || '')
      setCategoriaSeleccionada(preselectedCategoriaId || '')
      setSubcategoriaSeleccionada('')
      setMonto('')
      setComentario('')
    }
  }, [open, preselectedSobreId, preselectedCategoriaId])

  // Filtrar subcategorías cuando cambia la categoría seleccionada
  useEffect(() => {
    if (categoriaSeleccionada) {
      const filtered = subcategorias.filter(
        (sub) => sub.categoria_id === categoriaSeleccionada
      )
      setSubcategorias(filtered)
      setSubcategoriaSeleccionada('')
    }
  }, [categoriaSeleccionada])

  // Auto-select billetera si solo hay una
  useEffect(() => {
    if (billeteras.length === 1 && !billeteraSeleccionada) {
      setBilleteraSeleccionada(billeteras[0].id)
    }
  }, [billeteras, billeteraSeleccionada])

  const fetchData = async () => {
    try {
      // Fetch sobres
      const sobresResponse = await fetch('/api/sobres')
      if (sobresResponse.ok) {
        const sobresData = await sobresResponse.json()
        const sobresList = sobresData.sobres || []
        setSobres(sobresList)
        if (sobresList.length > 0 && !sobreSeleccionado) {
          setSobreSeleccionado(sobresList[0].id)
        }
      }

      // Fetch billeteras
      const billeterasResponse = await fetch('/api/billeteras')
      if (billeterasResponse.ok) {
        const billeterasData = await billeterasResponse.json()
        const billeterasList = billeterasData.billeteras || []
        setBilleteras(billeterasList)
      }

      // Fetch categorías
      const categoriasResponse = await fetch('/api/categorias')
      if (categoriasResponse.ok) {
        const categoriasData = await categoriasResponse.json()
        setCategorias(categoriasData.categorias || [])
      }

      // Fetch todas las subcategorías (las filtraremos por categoría seleccionada)
      const subcategoriasResponse = await fetch('/api/subcategorias')
      if (subcategoriasResponse.ok) {
        const subcategoriasData = await subcategoriasResponse.json()
        setSubcategorias(subcategoriasData.subcategorias || [])
      }
    } catch (error) {
      console.error('Error al cargar datos:', error)
      notify.error('Error al cargar formulario')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validar campos requeridos
      if (!sobreSeleccionado) {
        notify.error('Selecciona un sobre')
        setLoading(false)
        return
      }
      if (!billeteraSeleccionada) {
        notify.error('Selecciona una billetera')
        setLoading(false)
        return
      }
      if (!categoriaSeleccionada) {
        notify.error('La categoría es obligatoria')
        setLoading(false)
        return
      }
      if (!monto || parseFloat(monto) <= 0) {
        notify.error('Ingresa un monto válido')
        setLoading(false)
        return
      }

      const result = await crearGasto({
        monto: parseFloat(monto),
        monedaId: billeteras.find((b) => b.id === billeteraSeleccionada)?.moneda_principal_id || '',
        billeteraId: billeteraSeleccionada,
        tipo: 'GASTO',
        descripcion: comentario || undefined,
        fecha: new Date().toISOString(),
        sobreId: sobreSeleccionado,
        categoriaId: categoriaSeleccionada,
        subcategoriaId: subcategoriaSeleccionada || undefined,
      })

      notify.success('Gasto registrado correctamente')

      // Check for warnings
      if (result.warning) {
        notify.warning(`${result.warning.type}: ${result.warning.message}`)
      }

      // Reset form
      setMonto('')
      setComentario('')

      // Close drawer
      onOpenChange(false)

      // Callback
      onSuccess?.()
    } catch (err: any) {
      notify.error(err.message || 'Error al registrar gasto')
    } finally {
      setLoading(false)
    }
  }

  const billeteraActual = billeteras.find((b) => b.id === billeteraSeleccionada)
  const sobreActual = sobres.find((s) => s.id === sobreSeleccionado)
  const subcategoriasFiltered = subcategorias.filter(
    (sub) => sub.categoria_id === categoriaSeleccionada
  )

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Registrar Gasto</DrawerTitle>
          <DrawerDescription>
            Crea un nuevo gasto en un sobre
          </DrawerDescription>
        </DrawerHeader>

        <DrawerBody>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Sobre */}
            <div className="space-y-2">
              <Label htmlFor="sobre">
                Sobre <span className="text-red-500">*</span>
              </Label>
              {sobres.length === 1 ? (
                <div className="flex items-center gap-2 p-2 rounded-lg border bg-slate-50">
                  <Badge variant="outline">
                    {sobreActual?.emoji} {sobreActual?.nombre}
                  </Badge>
                </div>
              ) : (
                <Select value={sobreSeleccionado} onValueChange={setSobreSeleccionado}>
                  <SelectTrigger id="sobre">
                    <SelectValue placeholder="Seleccionar sobre" />
                  </SelectTrigger>
                  <SelectContent>
                    {sobres.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        <span className="mr-2">{s.emoji || '📧'}</span>
                        <span className="font-medium">{s.nombre}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Billetera */}
            <div className="space-y-2">
              <Label htmlFor="billetera">
                Billetera <span className="text-red-500">*</span>
              </Label>
              {billeteras.length === 1 ? (
                <div className="flex items-center gap-2 p-2 rounded-lg border bg-slate-50">
                  <Badge variant="outline">
                    {billeteraActual?.emoji || '💳'} {billeteraActual?.nombre}
                  </Badge>
                </div>
              ) : (
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
              )}
              {billeteraActual && (
                <p className="text-xs text-muted-foreground">
                  Saldo: ${Number(billeteraActual.saldo_real || 0).toFixed(2)}
                </p>
              )}
            </div>

            {/* Categoría */}
            <div className="space-y-2">
              <Label htmlFor="categoria">
                Categoría <span className="text-red-500">*</span>
              </Label>
              <Select value={categoriaSeleccionada} onValueChange={setCategoriaSeleccionada}>
                <SelectTrigger id="categoria">
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categorias.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      <span className="mr-2">{c.emoji || '📁'}</span>
                      <span className="font-medium">{c.nombre}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Subcategoría */}
            {categoriaSeleccionada && subcategoriasFiltered.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="subcategoria">Subcategoría (opcional)</Label>
                <Select value={subcategoriaSeleccionada} onValueChange={setSubcategoriaSeleccionada}>
                  <SelectTrigger id="subcategoria">
                    <SelectValue placeholder="Seleccionar marca/empresa" />
                  </SelectTrigger>
                  <SelectContent>
                    {subcategoriasFiltered.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        <span className="mr-2">{s.emoji || '🏢'}</span>
                        <span className="font-medium">{s.nombre}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

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

            {/* Comentario */}
            <div className="space-y-2">
              <Label htmlFor="comentario">Comentario (opcional)</Label>
              <Input
                id="comentario"
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                placeholder="Ej: Almuerzo en la oficina"
              />
            </div>
          </form>
        </DrawerBody>

        <DrawerFooter>
          <Button
            onClick={handleSubmit}
            disabled={
              loading || !sobreSeleccionado || !billeteraSeleccionada || !categoriaSeleccionada || !monto
            }
            className="w-full"
          >
            {loading ? 'Registrando...' : 'Registrar Gasto'}
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
