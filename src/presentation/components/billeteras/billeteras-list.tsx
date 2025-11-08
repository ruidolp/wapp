/**
 * Billeteras List - Display all user wallets
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Wallet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { apiClient, getErrorMessage } from '@/infrastructure/lib/api-client'
import { BilleteraCard } from './billetera-card'
import { BilleteraForm } from './billetera-form'

interface Billetera {
  id: string
  nombre: string
  tipo: string
  moneda_principal_id: string
  saldo_real: number
  saldo_proyectado: number
  color: string | null
  emoji: string | null
  is_compartida: boolean
  created_at: string
}

export function BilleterasList() {
  const router = useRouter()
  const { toast } = useToast()
  const [billeteras, setBilleteras] = useState<Billetera[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  const fetchBilleteras = async () => {
    try {
      setIsLoading(true)
      const data = await apiClient.get('/api/billeteras')
      setBilleteras(data.billeteras || [])
    } catch (error) {
      console.error('Error al cargar billeteras:', error)
      toast({
        title: 'Error',
        description: getErrorMessage(error),
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchBilleteras()
  }, [])

  const handleBilleteraCreated = () => {
    setShowForm(false)
    fetchBilleteras()
    toast({
      title: 'Billetera creada',
      description: 'La billetera se ha creado correctamente',
    })
  }

  const handleBilleteraDeleted = () => {
    fetchBilleteras()
    toast({
      title: 'Billetera eliminada',
      description: 'La billetera se ha eliminado correctamente',
    })
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cargando billeteras...</CardTitle>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Mis Billeteras</h2>
          <p className="text-muted-foreground">
            Gestiona tus billeteras y consulta tus saldos
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Billetera
        </Button>
      </div>

      {showForm && (
        <BilleteraForm
          onSuccess={handleBilleteraCreated}
          onCancel={() => setShowForm(false)}
        />
      )}

      {billeteras.length === 0 ? (
        <Card>
          <CardHeader className="text-center py-12">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-muted flex items-center justify-center">
              <Wallet className="h-6 w-6 text-muted-foreground" />
            </div>
            <CardTitle>No tienes billeteras</CardTitle>
            <CardDescription>
              Crea tu primera billetera para comenzar a gestionar tus finanzas
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {billeteras.map((billetera) => (
            <BilleteraCard
              key={billetera.id}
              billetera={billetera}
              onDeleted={handleBilleteraDeleted}
            />
          ))}
        </div>
      )}
    </div>
  )
}
