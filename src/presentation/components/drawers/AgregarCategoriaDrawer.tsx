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
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { notify } from '@/infrastructure/lib/notifications'
import { useInputFocus } from '@/presentation/hooks/useInputFocus'

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

interface AgregarCategoriaDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sobreId: string
  sobreName: string
  userId: string
  onSuccess?: () => void
}

export function AgregarCategoriaDrawer({
  open,
  onOpenChange,
  sobreId,
  sobreName,
  userId,
  onSuccess,
}: AgregarCategoriaDrawerProps) {
  const [loading, setLoading] = useState(false)
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [subcategorias, setSubcategorias] = useState<Subcategoria[]>([])
  const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState<string[]>([])
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>('')
  const [nombreNuevaCategoria, setNombreNuevaCategoria] = useState('')
  const [nombreNuevaSubcategoria, setNombreNuevaSubcategoria] = useState('')
  const [creandoCategoria, setCreandoCategoria] = useState(false)
  const [creandoSubcategoria, setCreandoSubcategoria] = useState(false)

  const categoriaNuevaRef = useRef<HTMLInputElement>(null)
  const subcategoriaNuevaRef = useRef<HTMLInputElement>(null)

  // Cargar datos cuando se abre el drawer
  useEffect(() => {
    if (open) {
      fetchData()
      setCategoriasSeleccionadas([])
      setCategoriaSeleccionada('')
      setNombreNuevaCategoria('')
      setNombreNuevaSubcategoria('')
      setCreandoCategoria(false)
      setCreandoSubcategoria(false)
    }
  }, [open])

  // Cargar subcategorías cuando cambia la categoría seleccionada
  useEffect(() => {
    if (categoriaSeleccionada) {
      fetchSubcategorias()
    }
  }, [categoriaSeleccionada])

  const fetchData = async () => {
    try {
      const response = await fetch('/api/categorias')
      if (response.ok) {
        const data = await response.json()
        setCategorias(data.categorias || [])
      }
    } catch (error) {
      console.error('Error al cargar categorías:', error)
      notify.error('Error al cargar categorías')
    }
  }

  const fetchSubcategorias = async () => {
    if (!categoriaSeleccionada) return
    try {
      const response = await fetch(`/api/subcategorias?categoriaId=${categoriaSeleccionada}`)
      if (response.ok) {
        const data = await response.json()
        setSubcategorias(data.subcategorias || [])
      }
    } catch (error) {
      console.error('Error al cargar subcategorías:', error)
    }
  }

  const handleCrearCategoria = async (e?: any) => {
    if (!nombreNuevaCategoria.trim()) {
      notify.error('Ingresa un nombre para la categoría')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/categorias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: nombreNuevaCategoria.trim(),
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al crear categoría')
      }

      const data = await response.json()
      const nuevaCategoria = data.categoria

      // Agregar a la lista de seleccionadas
      setCategoriasSeleccionadas([...categoriasSeleccionadas, nuevaCategoria.id])
      setCategorias([...categorias, nuevaCategoria])
      setNombreNuevaCategoria('')
      setCreandoCategoria(false)
      notify.success('Categoría creada')
    } catch (error: any) {
      notify.error(error.message || 'Error al crear categoría')
    } finally {
      setLoading(false)
    }
  }

  const handleCrearSubcategoria = async (e?: any) => {
    if (!nombreNuevaSubcategoria.trim()) {
      notify.error('Ingresa un nombre para la marca/empresa')
      return
    }
    if (!categoriaSeleccionada) {
      notify.error('Selecciona una categoría primero')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/subcategorias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: nombreNuevaSubcategoria.trim(),
          categoriaId: categoriaSeleccionada,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al crear marca/empresa')
      }

      const data = await response.json()
      const nuevaSubcategoria = data.subcategoria

      // Agregar a la lista
      setSubcategorias([...subcategorias, nuevaSubcategoria])
      setNombreNuevaSubcategoria('')
      setCreandoSubcategoria(false)
      notify.success('Marca/empresa creada')
    } catch (error: any) {
      notify.error(error.message || 'Error al crear marca/empresa')
    } finally {
      setLoading(false)
    }
  }

  const handleAddCategoria = (categoriaId: string) => {
    if (!categoriasSeleccionadas.includes(categoriaId)) {
      setCategoriasSeleccionadas([...categoriasSeleccionadas, categoriaId])
    }
  }

  const handleRemoveCategoria = (categoriaId: string) => {
    setCategoriasSeleccionadas(categoriasSeleccionadas.filter((id) => id !== categoriaId))
  }

  const handleSubmit = async (e?: any) => {
    if (categoriasSeleccionadas.length === 0) {
      notify.error('Selecciona al menos una categoría')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/sobres/${sobreId}/categorias`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoriaIds: categoriasSeleccionadas,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al agregar categorías')
      }

      notify.success('Categorías agregadas al sobre')
      onOpenChange(false)
      onSuccess?.()
    } catch (error: any) {
      notify.error(error.message || 'Error al agregar categorías')
    } finally {
      setLoading(false)
    }
  }

  const categoriasDisponibles = categorias.filter(
    (c) => !categoriasSeleccionadas.includes(c.id)
  )

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Agregar Categorías</DrawerTitle>
          <DrawerDescription>
            Agrega categorías y marcas/empresas al sobre &quot;{sobreName}&quot;
          </DrawerDescription>
        </DrawerHeader>

        <DrawerBody>
          <div className="space-y-6">
            {/* Categorías Seleccionadas */}
            {categoriasSeleccionadas.length > 0 && (
              <div className="space-y-2">
                <Label>Categorías Seleccionadas</Label>
                <div className="flex flex-wrap gap-2">
                  {categoriasSeleccionadas.map((catId) => {
                    const cat = categorias.find((c) => c.id === catId)
                    return (
                      <Badge
                        key={catId}
                        variant="default"
                        className="cursor-pointer"
                        onClick={() => handleRemoveCategoria(catId)}
                      >
                        {cat?.emoji} {cat?.nombre} ✕
                      </Badge>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Agregar Categoría */}
            <div className="space-y-2 border-t pt-4">
              <Label htmlFor="categoria">Agregar Categoría</Label>

              {creandoCategoria ? (
                <div className="space-y-2">
                  <Input
                    ref={categoriaNuevaRef}
                    type="text"
                    placeholder="Nombre de la categoría"
                    value={nombreNuevaCategoria}
                    onChange={(e) => setNombreNuevaCategoria(e.target.value)}
                    required
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={handleCrearCategoria}
                      disabled={loading || !nombreNuevaCategoria.trim()}
                      size="sm"
                      className="flex-1"
                    >
                      Crear
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setCreandoCategoria(false)
                        setNombreNuevaCategoria('')
                      }}
                      disabled={loading}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {categoriasDisponibles.length > 0 ? (
                    <Select value="" onValueChange={handleAddCategoria}>
                      <SelectTrigger id="categoria">
                        <SelectValue placeholder="Seleccionar categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        {categoriasDisponibles.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            <span className="mr-2">{c.emoji || '📁'}</span>
                            <span className="font-medium">{c.nombre}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Alert>
                      <AlertDescription>
                        No hay categorías disponibles
                      </AlertDescription>
                    </Alert>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCreandoCategoria(true)}
                    className="w-full"
                  >
                    ➕ Crear nueva categoría
                  </Button>
                </div>
              )}
            </div>

            {/* Subcategorías (Marcas/Empresas) */}
            {categoriaSeleccionada && (
              <div className="space-y-2 border-t pt-4">
                <Label htmlFor="subcategoria">
                  Marcas/Empresas para {categorias.find((c) => c.id === categoriaSeleccionada)?.nombre}
                </Label>

                {creandoSubcategoria ? (
                  <div className="space-y-2">
                    <Input
                      ref={subcategoriaNuevaRef}
                      type="text"
                      placeholder="Nombre de la marca/empresa"
                      value={nombreNuevaSubcategoria}
                      onChange={(e) => setNombreNuevaSubcategoria(e.target.value)}
                      required
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={handleCrearSubcategoria}
                        disabled={loading || !nombreNuevaSubcategoria.trim()}
                        size="sm"
                        className="flex-1"
                      >
                        Crear
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setCreandoSubcategoria(false)
                          setNombreNuevaSubcategoria('')
                        }}
                        disabled={loading}
                        className="flex-1"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {subcategorias.length > 0 ? (
                      <Select value="" onValueChange={() => {}}>
                        <SelectTrigger id="subcategoria">
                          <SelectValue placeholder="Ver marcas/empresas disponibles" />
                        </SelectTrigger>
                        <SelectContent>
                          {subcategorias.map((s) => (
                            <SelectItem key={s.id} value={s.id} disabled>
                              <span className="mr-2">{s.emoji || '🏢'}</span>
                              <span className="font-medium">{s.nombre}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Alert>
                        <AlertDescription>
                          No hay marcas/empresas en esta categoría
                        </AlertDescription>
                      </Alert>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCreandoSubcategoria(true)}
                      className="w-full"
                    >
                      ➕ Crear nueva marca/empresa
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </DrawerBody>

        <DrawerFooter>
          <Button
            onClick={() => handleSubmit()}
            disabled={loading || categoriasSeleccionadas.length === 0}
            className="w-full"
          >
            {loading ? 'Agregando...' : 'Agregar Categorías'}
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
