/**
 * Billetera Card - Individual wallet card component
 */

'use client'

import { useState } from 'react'
import { Trash2, Edit, MoreVertical } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { apiClient, getErrorMessage } from '@/infrastructure/lib/api-client'

interface BilleteraCardProps {
  billetera: {
    id: string
    nombre: string
    tipo: string
    saldo_real: number
    saldo_proyectado: number
    color: string | null
    emoji: string | null
    is_compartida: boolean
  }
  onDeleted: () => void
}

const tipoLabels: Record<string, string> = {
  DEBITO: 'Débito',
  CREDITO: 'Crédito',
  EFECTIVO: 'Efectivo',
  AHORRO: 'Ahorro',
  INVERSION: 'Inversión',
  PRESTAMO: 'Préstamo',
}

const tipoColors: Record<string, string> = {
  DEBITO: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  CREDITO: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  EFECTIVO: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  AHORRO: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  INVERSION: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  PRESTAMO: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
}

export function BilleteraCard({ billetera, onDeleted }: BilleteraCardProps) {
  const { toast } = useToast()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      await apiClient.delete(`/api/billeteras/${billetera.id}`)
      onDeleted()
    } catch (error) {
      console.error('Error al eliminar billetera:', error)
      toast({
        title: 'Error',
        description: getErrorMessage(error),
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <div className="flex items-center space-x-2">
            {billetera.emoji && (
              <span className="text-2xl">{billetera.emoji}</span>
            )}
            <div>
              <h3 className="font-semibold">{billetera.nombre}</h3>
              <Badge
                variant="secondary"
                className={tipoColors[billetera.tipo] || ''}
              >
                {tipoLabels[billetera.tipo] || billetera.tipo}
              </Badge>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>
              <p className="text-sm text-muted-foreground">Saldo Real</p>
              <p className="text-2xl font-bold">
                {formatCurrency(Number(billetera.saldo_real))}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Saldo Proyectado</p>
              <p className="text-sm font-medium">
                {formatCurrency(Number(billetera.saldo_proyectado))}
              </p>
            </div>
            {billetera.is_compartida && (
              <Badge variant="outline">Compartida</Badge>
            )}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar billetera?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La billetera {billetera.nombre} será
              eliminada permanentemente.
              {Number(billetera.saldo_real) !== 0 && (
                <span className="block mt-2 text-destructive font-medium">
                  Advertencia: Esta billetera tiene saldo. Transfiere el saldo antes de eliminar.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
