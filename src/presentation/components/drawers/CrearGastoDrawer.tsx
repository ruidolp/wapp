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
  const [todasSubcategorias, setTodasSubcategorias] = useState<Subcategoria[]>([])
  const [subcategoriasFiltradas, setSubcategoriasFiltradas] = useState<Subcategoria[]>([])

  const [sobreSeleccionado, setSobreSeleccionado] = useState<string>('')
  const [billeteraSeleccionada, setBilleteraSeleccionada] = useState<string>('')
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>('')
  const [subcategoriaSeleccionada, setSubcategoriaSeleccionada] = useState<string>('')
  const [monto, setMonto] = useState('')
  const [comentario, setComentario] = useState('')

  // Estados para autocomplete de marcas
  const [inputMarca, setInputMarca] = useState('')
  const [sugerenciasMarcas, setSugerenciasMarcas] = useState<Subcategoria[]>([])
  const [showSugerenciasMarcas, setShowSugerenciasMarcas] = useState(false)

  const montoRef = useRef<HTMLInputElement>(null)
  const marcaRef = useRef<HTMLInputElement>(null)
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
      setInputMarca('')
      setMonto('')
      setComentario('')
      setSugerenciasMarcas([])
      setShowSugerenciasMarcas(false)
    }
  }, [open, preselectedSobreId, preselectedCategoriaId])

  // Cargar categorías del sobre cuando se selecciona
  useEffect(() => {
    const fetchCategoriasSobre = async () => {
      if (!sobreSeleccionado) return

      try {
        const response = await fetch(`/api/sobres/${sobreSeleccionado}/categorias`)
        if (response.ok) {
          const data = await response.json()
          setCategorias(data.categorias || [])
        }
      } catch (error) {
        console.error('Error al cargar categorías del sobre:', error)
      }
    }

    fetchCategoriasSobre()
  }, [sobreSeleccionado])

  // Cargar subcategorías cuando cambia la categoría seleccionada
  useEffect(() => {
    const fetchSubcategorias = async () => {
      if (!categoriaSeleccionada) {
        setSubcategoriasFiltradas([])
        return
      }

      try {
        const response = await fetch(`/api/subcategorias?categoriaId=${categoriaSeleccionada}`)
        if (response.ok) {
          const data = await response.json()
          setSubcategoriasFiltradas(data.subcategorias || [])
        }
      } catch (error) {
        console.error('Error al cargar subcategorías:', error)
      }
    }

    fetchSubcategorias()
    setSubcategoriaSeleccionada('')
    setInputMarca('')
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

      // Fetch todas las subcategorías del usuario (para autocomplete)
      const subcategoriasResponse = await fetch('/api/subcategorias')
      if (subcategoriasResponse.ok) {
        const subcategoriasData = await subcategoriasResponse.json()
        setTodasSubcategorias(subcategoriasData.subcategorias || [])
      }
    } catch (error) {
      console.error('Error al cargar datos:', error)
      notify.error('Error al cargar formulario')
    }
  }

  // Manejar cambios en el input de marca
  const handleInputMarcaChange = (value: string) => {
    setInputMarca(value)

    if (!value.trim()) {
      setSugerenciasMarcas([])
      setShowSugerenciasMarcas(false)
      return
    }

    // Filtrar subcategorías de la categoría actual que coincidan con la búsqueda
    const filtered = subcategoriasFiltradas.filter((sub) =>
      sub.nombre.toLowerCase().includes(value.toLowerCase())
    )

    setSugerenciasMarcas(filtered)
    setShowSugerenciasMarcas(filtered.length > 0)
  }

  // Click en sugerencia de marca
  const handleSelectMarca = (subcategoria: Subcategoria) => {
    setSubcategoriaSeleccionada(subcategoria.id)
    setInputMarca('')
    setSugerenciasMarcas([])
    setShowSugerenciasMarcas(false)
    marcaRef.current?.focus()
  }

  // Manejar ENTER en el input de marca
  const handleMarcaKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return
    e.preventDefault()

    const trimmedValue = inputMarca.trim()
    if (!trimmedValue) return

    // Buscar si ya existe una subcategoría con ese nombre
    const existe = subcategoriasFiltradas.find(
      (s) => s.nombre.toLowerCase() === trimmedValue.toLowerCase()
    )

    if (existe) {
      // Si existe, seleccionarla
      setSubcategoriaSeleccionada(existe.id)
      setInputMarca('')
    } else {
      // Si no existe, crearla
      await crearNuevaMarca(trimmedValue)
    }

    setSugerenciasMarcas([])
    setShowSugerenciasMarcas(false)
    marcaRef.current?.focus()
  }

  // Crear nueva marca/subcategoría
  const crearNuevaMarca = async (nombre: string) => {
    if (!categoriaSeleccionada) {
      notify.error('Selecciona una categoría primero')
      return
    }

    try {
      const response = await fetch('/api/subcategorias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, categoriaId: categoriaSeleccionada }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al crear marca')
      }

      const data = await response.json()
      const nuevaMarca = data.subcategoria

      // Actualizar listas
      setTodasSubcategorias([...todasSubcategorias, nuevaMarca])
      setSubcategoriasFiltradas([...subcategoriasFiltradas, nuevaMarca])
      setSubcategoriaSeleccionada(nuevaMarca.id)
      setInputMarca('')

      notify.success(`Marca "${nombre}" creada`)
    } catch (error: any) {
      notify.error(error.message || 'Error al crear marca')
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

            {/* Marca/Subcategoría con autocomplete */}
            {categoriaSeleccionada && (
              <>
                {/* Separador */}
                <div className="border-t border-gray-200 my-4" />

                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label>¿Dónde compras?</Label>
                    <p className="text-xs text-muted-foreground">
                      Agrega tus marcas recurrentes para que puedas medir tus gastos
                    </p>
                  </div>

                  {/* Marca seleccionada (solo 1) */}
                  {subcategoriaSeleccionada && (
                    <div className="space-y-2">
                      <Label>Marca seleccionada</Label>
                      <div className="flex flex-wrap gap-2">
                        {(() => {
                          const marcaSeleccionada = subcategoriasFiltradas.find(
                            (s) => s.id === subcategoriaSeleccionada
                          )
                          return marcaSeleccionada ? (
                            <Badge
                              key={marcaSeleccionada.id}
                              variant="default"
                              className="cursor-pointer gap-1 pl-2"
                            >
                              {marcaSeleccionada.emoji && <span>{marcaSeleccionada.emoji}</span>}
                              <span>{marcaSeleccionada.nombre}</span>
                              <button
                                onClick={() => {
                                  setSubcategoriaSeleccionada('')
                                  setInputMarca('')
                                }}
                                className="ml-1 hover:opacity-70"
                                type="button"
                              >
                                ✕
                              </button>
                            </Badge>
                          ) : null
                        })()}
                      </div>
                    </div>
                  )}

                  {/* Input de búsqueda/creación */}
                  <div className="space-y-2">
                    <Label htmlFor="marca">Buscar o crear marca</Label>
                    <div className="relative">
                      <Input
                        ref={marcaRef}
                        id="marca"
                        type="text"
                        placeholder="Escribe nombre de marca (Ej: Walmart)"
                        value={inputMarca}
                        onChange={(e) => handleInputMarcaChange(e.target.value)}
                        onKeyDown={handleMarcaKeyDown}
                        onFocus={() => {
                          if (inputMarca && sugerenciasMarcas.length > 0) {
                            setShowSugerenciasMarcas(true)
                          }
                        }}
                        onBlur={() => {
                          // Delay para permitir click en sugerencia
                          setTimeout(() => setShowSugerenciasMarcas(false), 200)
                        }}
                      />

                      {/* Sugerencias */}
                      {showSugerenciasMarcas && sugerenciasMarcas.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 border rounded-md bg-white shadow-lg z-10 max-h-48 overflow-y-auto">
                          {sugerenciasMarcas.map((marca) => (
                            <button
                              key={marca.id}
                              onClick={() => handleSelectMarca(marca)}
                              className="w-full text-left px-3 py-2 hover:bg-slate-100 flex items-center gap-2 text-sm"
                              type="button"
                            >
                              <span className="text-green-600">✓</span>
                              <span>{marca.emoji && `${marca.emoji} `}</span>
                              <span>{marca.nombre}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Presiona <kbd className="px-2 py-1 bg-slate-100 rounded text-xs">ENTER</kbd> para crear nueva
                    </p>
                  </div>
                </div>
              </>
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
