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
import { Alert, AlertDescription } from '@/components/ui/alert'
import { notify } from '@/infrastructure/lib/notifications'

interface Categoria {
  id: string
  nombre: string
  emoji?: string
  color?: string
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
  const [selectedCategories, setSelectedCategories] = useState<Categoria[]>([])
  const [inputValue, setInputValue] = useState('')
  const [suggestions, setSuggestions] = useState<Categoria[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Cargar categorías globales cuando se abre el drawer
  useEffect(() => {
    if (open) {
      fetchCategorias()
      setSelectedCategories([])
      setInputValue('')
      setSuggestions([])
      setShowSuggestions(false)
    }
  }, [open])

  const fetchCategorias = async () => {
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

  // Manejar cambios en el input
  const handleInputChange = (value: string) => {
    setInputValue(value)

    if (!value.trim()) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    // Filtrar categorías globales que no estén ya seleccionadas
    const filtered = categorias.filter((cat) => {
      const yaEstaSeleccionada = selectedCategories.some((s) => s.id === cat.id)
      const coincideConBusqueda = cat.nombre.toLowerCase().includes(value.toLowerCase())
      return !yaEstaSeleccionada && coincideConBusqueda
    })

    setSuggestions(filtered)
    setShowSuggestions(filtered.length > 0)
  }

  // Click en sugerencia
  const handleSelectSuggestion = (categoria: Categoria) => {
    setSelectedCategories([...selectedCategories, categoria])
    setInputValue('')
    setSuggestions([])
    setShowSuggestions(false)
    inputRef.current?.focus()
  }

  // Remover categoría seleccionada
  const handleRemoveCategory = (categoriaId: string) => {
    setSelectedCategories(selectedCategories.filter((c) => c.id !== categoriaId))
  }

  // Manejar ENTER en el input
  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return
    e.preventDefault()

    const trimmedValue = inputValue.trim()
    if (!trimmedValue) return

    // Buscar si ya existe una categoría con ese nombre exacto
    const existe = categorias.find((c) => c.nombre.toLowerCase() === trimmedValue.toLowerCase())

    if (existe) {
      // Si existe, simplemente la agregamos
      const yaEstaSeleccionada = selectedCategories.some((s) => s.id === existe.id)
      if (!yaEstaSeleccionada) {
        setSelectedCategories([...selectedCategories, existe])
      }
    } else {
      // Si no existe, la creamos como NUEVA
      await crearYAgregarCategoria(trimmedValue)
    }

    setInputValue('')
    setSuggestions([])
    setShowSuggestions(false)
    inputRef.current?.focus()
  }

  // Crear nueva categoría
  const crearYAgregarCategoria = async (nombre: string) => {
    setLoading(true)
    try {
      const response = await fetch('/api/categorias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al crear categoría')
      }

      const data = await response.json()
      const nuevaCategoria = data.categoria

      // Agregar a la lista global
      setCategorias([...categorias, nuevaCategoria])

      // Agregar a seleccionadas
      setSelectedCategories([...selectedCategories, nuevaCategoria])

      notify.success(`Categoría "${nombre}" creada`)
    } catch (error: any) {
      notify.error(error.message || 'Error al crear categoría')
    } finally {
      setLoading(false)
    }
  }

  // Guardar categorías en el sobre
  const handleGuardar = async () => {
    if (selectedCategories.length === 0) {
      notify.error('Selecciona al menos una categoría')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/sobres/${sobreId}/categorias`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoriaIds: selectedCategories.map((c) => c.id),
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al agregar categorías')
      }

      notify.success(`${selectedCategories.length} categoría(s) agregada(s) al sobre`)
      onOpenChange(false)
      onSuccess?.()
    } catch (error: any) {
      notify.error(error.message || 'Error al agregar categorías')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Agregar Categoría</DrawerTitle>
          <DrawerDescription>
            Agrega categorías al sobre &quot;{sobreName}&quot;
          </DrawerDescription>
        </DrawerHeader>

        <DrawerBody>
          <div className="space-y-4">
            {/* Input con búsqueda */}
            <div className="space-y-2">
              <Label htmlFor="categoria">Nombre</Label>
              <div className="relative">
                <Input
                  ref={inputRef}
                  id="categoria"
                  type="text"
                  placeholder="Escribe nombre de categoría (Ej: Alimentación)"
                  value={inputValue}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => {
                    if (inputValue && suggestions.length > 0) {
                      setShowSuggestions(true)
                    }
                  }}
                  onBlur={() => {
                    // Delay para permitir click en sugerencia
                    setTimeout(() => setShowSuggestions(false), 200)
                  }}
                />

                {/* Sugerencias */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 border rounded-md bg-white shadow-lg z-10">
                    {suggestions.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => handleSelectSuggestion(cat)}
                        className="w-full text-left px-3 py-2 hover:bg-slate-100 flex items-center gap-2 text-sm"
                        type="button"
                      >
                        <span className="text-green-600">✓</span>
                        <span>{cat.emoji && `${cat.emoji} `}</span>
                        <span>{cat.nombre}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Presiona <kbd className="px-2 py-1 bg-slate-100 rounded text-xs">ENTER</kbd> para crear nueva
              </p>
            </div>

            {/* Categorías seleccionadas */}
            {selectedCategories.length > 0 && (
              <div className="space-y-2">
                <Label>Categorías seleccionadas</Label>
                <div className="flex flex-wrap gap-2">
                  {selectedCategories.map((cat) => (
                    <Badge
                      key={cat.id}
                      variant="default"
                      className="cursor-pointer gap-1 pl-2"
                    >
                      {cat.emoji && <span>{cat.emoji}</span>}
                      <span>{cat.nombre}</span>
                      <button
                        onClick={() => handleRemoveCategory(cat.id)}
                        className="ml-1 hover:opacity-70"
                        type="button"
                      >
                        ✕
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Info */}
            {selectedCategories.length === 0 && (
              <Alert>
                <AlertDescription>
                  Selecciona o crea al menos una categoría
                </AlertDescription>
              </Alert>
            )}
          </div>
        </DrawerBody>

        <DrawerFooter>
          <Button
            onClick={handleGuardar}
            disabled={loading || selectedCategories.length === 0}
            className="w-full"
          >
            {loading ? 'Guardando...' : 'Guardar'}
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
