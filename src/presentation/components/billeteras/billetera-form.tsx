/**
 * Billetera Form - Create/edit wallet form
 */

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { apiClient, getErrorMessage } from '@/infrastructure/lib/api-client'

interface BilleteraFormProps {
  onSuccess: () => void
  onCancel: () => void
}

const tiposBilletera = [
  { value: 'DEBITO', label: 'Cuenta Débito' },
  { value: 'CREDITO', label: 'Tarjeta de Crédito' },
  { value: 'EFECTIVO', label: 'Efectivo' },
  { value: 'AHORRO', label: 'Cuenta de Ahorro' },
  { value: 'INVERSION', label: 'Inversión' },
  { value: 'PRESTAMO', label: 'Préstamo' },
]

const emojis = ['💳', '💰', '🏦', '💵', '💴', '💶', '💷', '🪙', '📊', '💸']

const colores = [
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#10b981', // green
  '#f59e0b', // yellow
  '#ef4444', // red
  '#06b6d4', // cyan
  '#ec4899', // pink
  '#6366f1', // indigo
]

export function BilleteraForm({ onSuccess, onCancel }: BilleteraFormProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    nombre: '',
    tipo: 'DEBITO',
    saldoInicial: '0',
    emoji: '💳',
    color: '#3b82f6',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.nombre.trim()) {
      toast({
        title: 'Error',
        description: 'El nombre es requerido',
        variant: 'destructive',
      })
      return
    }

    try {
      setIsLoading(true)
      await apiClient.post('/api/billeteras', {
        nombre: formData.nombre.trim(),
        tipo: formData.tipo,
        saldoInicial: parseFloat(formData.saldoInicial) || 0,
        emoji: formData.emoji,
        color: formData.color,
        isCompartida: false,
      })
      onSuccess()
    } catch (error) {
      console.error('Error al crear billetera:', error)
      toast({
        title: 'Error',
        description: getErrorMessage(error),
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nueva Billetera</CardTitle>
        <CardDescription>
          Crea una nueva billetera para gestionar tus finanzas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                placeholder="Ej: Cuenta Corriente"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo de Billetera</Label>
              <Select
                value={formData.tipo}
                onValueChange={(value) => setFormData({ ...formData, tipo: value })}
              >
                <SelectTrigger id="tipo">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tiposBilletera.map((tipo) => (
                    <SelectItem key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="saldoInicial">Saldo Inicial</Label>
              <Input
                id="saldoInicial"
                type="number"
                step="0.01"
                placeholder="0"
                value={formData.saldoInicial}
                onChange={(e) => setFormData({ ...formData, saldoInicial: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Emoji</Label>
              <div className="flex gap-2 flex-wrap">
                {emojis.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    className={`text-2xl p-2 rounded border-2 hover:bg-accent transition-colors ${
                      formData.emoji === emoji
                        ? 'border-primary'
                        : 'border-transparent'
                    }`}
                    onClick={() => setFormData({ ...formData, emoji })}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex gap-2 flex-wrap">
                {colores.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                      formData.color === color
                        ? 'border-foreground scale-110'
                        : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setFormData({ ...formData, color })}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creando...' : 'Crear Billetera'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
