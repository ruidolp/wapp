'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { SobreCard } from '@/components/cards/SobreCard'
import { CrearSobreDrawer } from '@/components/drawers/CrearSobreDrawer'
import { AgregarPresupuestoDrawer } from '@/components/drawers/AgregarPresupuestoDrawer'
import { OverspendWarningModal } from '@/components/modals/OverspendWarningModal'
import { notify } from '@/infrastructure/lib/notifications'
import { useSobre, useDevolverPresupuesto } from '@/presentation/hooks/useSobres'

interface Sobre {
  id: string
  nombre: string
  emoji?: string
  color?: string
  presupuesto_asignado: number
  gastado?: number
  asignaciones: any[]
  miAsignacion?: any[]
  resumen?: any[]
}

interface WarningType {
  type: 'OVERSPEND_SOBRE' | 'NEGATIVE_WALLET'
  message: string
  details: any
}

export function SobresScreen({ userId }: { userId: string }) {
  const router = useRouter()
  const [sobres, setSobres] = useState<Sobre[]>([])
  const [loading, setLoading] = useState(false)

  // Drawers y modales
  const [crearSobreOpen, setCrearSobreOpen] = useState(false)
  const [agregarPresupuestoOpen, setAgregarPresupuestoOpen] = useState(false)
  const [sobreSeleccionado, setSobreSeleccionado] = useState<Sobre | null>(null)
  const [warning, setWarning] = useState<WarningType | null>(null)
  const [warningModalOpen, setWarningModalOpen] = useState(false)

  // Hook para devolver presupuesto
  const { devolverPresupuesto, loading: devolverLoading } = useDevolverPresupuesto(
    sobreSeleccionado?.id || ''
  )

  // Cargar sobres
  useEffect(() => {
    fetchSobres()
  }, [])

  const fetchSobres = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/sobres')
      if (response.ok) {
        const data = await response.json()
        setSobres(data.sobres || [])
      } else {
        notify.error('Error al cargar sobres')
      }
    } catch (error) {
      console.error('Error:', error)
      notify.error('Error al cargar sobres')
    } finally {
      setLoading(false)
    }
  }

  const handleAgregarPresupuesto = (sobre: Sobre) => {
    setSobreSeleccionado(sobre)
    setAgregarPresupuestoOpen(true)
  }

  const handleDevolverPresupuesto = async (sobre: Sobre) => {
    setSobreSeleccionado(sobre)
    try {
      const result = await devolverPresupuesto()
      notify.success(result.message)
      fetchSobres()
    } catch (error) {
      notify.error('Error al devolver presupuesto')
    }
  }

  const handleDetalleSobre = (sobre: Sobre) => {
    // TODO: Navegar a página de detalle del sobre
    console.log('Detalle de sobre:', sobre.id)
  }

  const handleCrearSobreSuccess = () => {
    fetchSobres()
  }

  const handleAgregarPresupuestoSuccess = () => {
    fetchSobres()
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">Sobres</h2>
        <Button
          onClick={() => setCrearSobreOpen(true)}
          size="sm"
        >
          + Nuevo Sobre
        </Button>
      </div>

      {/* Contenido */}
      {loading ? (
        <div className="rounded-lg border bg-card p-8 text-center">
          <p className="text-muted-foreground">Cargando sobres...</p>
        </div>
      ) : sobres.length === 0 ? (
        <div className="rounded-lg border bg-card p-8 text-center space-y-4">
          <p className="text-muted-foreground">No tienes sobres aún</p>
          <Button
            onClick={() => setCrearSobreOpen(true)}
            variant="outline"
          >
            Crear tu primer sobre
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sobres.map((sobre) => (
            <SobreCard
              key={sobre.id}
              id={sobre.id}
              nombre={sobre.nombre}
              emoji={sobre.emoji}
              color={sobre.color}
              presupuestoAsignado={sobre.presupuesto_asignado}
              gastado={sobre.gastado || 0}
              asignaciones={sobre.asignaciones || []}
              onAgregar={() => handleAgregarPresupuesto(sobre)}
              onDetalle={() => handleDetalleSobre(sobre)}
              onDevolver={() => handleDevolverPresupuesto(sobre)}
            />
          ))}
        </div>
      )}

      {/* Drawers */}
      <CrearSobreDrawer
        open={crearSobreOpen}
        onOpenChange={setCrearSobreOpen}
        userId={userId}
      />

      <AgregarPresupuestoDrawer
        open={agregarPresupuestoOpen}
        onOpenChange={setAgregarPresupuestoOpen}
        sobreId={sobreSeleccionado?.id || ''}
        sobreName={sobreSeleccionado?.nombre || ''}
        onSuccess={handleAgregarPresupuestoSuccess}
      />

      {/* Warning Modal */}
      <OverspendWarningModal
        open={warningModalOpen}
        onOpenChange={setWarningModalOpen}
        warning={warning}
        onConfirm={() => {
          // TODO: Confirm transaction
          setWarningModalOpen(false)
        }}
        onAddBudget={() => {
          setWarningModalOpen(false)
          handleAgregarPresupuesto(sobreSeleccionado!)
        }}
        loading={false}
      />
    </div>
  )
}
