/**
 * BilleterasScreen - Vista de Billeteras completa
 */

'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useBilleteras, type Billetera } from '@/presentation/hooks/useBilleteras'
import { CardsList } from '@/presentation/components/billeteras/CardsList'
import { CardManageDrawer } from '@/presentation/components/billeteras/CardManageDrawer'
import { CardInfoDrawer } from '@/presentation/components/billeteras/CardInfoDrawer'
import { TransferDrawer } from '@/presentation/components/billeteras/TransferDrawer'
import { CardDeleteConfirm } from '@/presentation/components/billeteras/CardDeleteConfirm'
import { ContextualDrawer } from '@/presentation/components/billeteras/ContextualDrawer'

interface BilleterasScreenProps {
  onOpenContextual: () => void
}

export function BilleterasScreen({ onOpenContextual }: BilleterasScreenProps) {
  const t = useTranslations('billeteras')
  const { data: billeteras = [], isLoading } = useBilleteras()

  // Estado para drawers
  const [manageOpen, setManageOpen] = useState(false)
  const [infoOpen, setInfoOpen] = useState(false)
  const [transferOpen, setTransferOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  // Billetera seleccionada
  const [selectedBilletera, setSelectedBilletera] = useState<Billetera | null>(null)
  const [preselectedTransferId, setPreselectedTransferId] = useState<string | null>(null)

  // Handlers
  const handleEdit = (billetera: Billetera) => {
    setSelectedBilletera(billetera)
    setManageOpen(true)
  }

  const handleInfo = (billetera: Billetera) => {
    setSelectedBilletera(billetera)
    setInfoOpen(true)
  }

  const handleTransfer = (billetera?: Billetera) => {
    if (billetera) {
      setPreselectedTransferId(billetera.id)
    } else {
      setPreselectedTransferId(null)
    }
    setTransferOpen(true)
  }

  const handleDelete = (billetera: Billetera) => {
    setSelectedBilletera(billetera)
    setDeleteOpen(true)
  }

  const handleCreate = () => {
    setSelectedBilletera(null)
    setManageOpen(true)
  }

  // Desde CardInfoDrawer
  const handleEditFromInfo = () => {
    setInfoOpen(false)
    setManageOpen(true)
  }

  const handleTransferFromInfo = () => {
    setInfoOpen(false)
    setTransferOpen(true)
  }

  if (isLoading) {
    return (
      <div className="p-4 flex items-center justify-center">
        <p className="text-muted-foreground">{t('common.loading')}</p>
      </div>
    )
  }

  return (
    <>
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">{t('title')}</h2>
        </div>

        <CardsList
          billeteras={billeteras}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onTransfer={handleTransfer}
          onInfo={handleInfo}
        />
      </div>

      {/* Drawers */}
      <CardManageDrawer
        open={manageOpen}
        onOpenChange={setManageOpen}
        billetera={selectedBilletera}
      />

      <CardInfoDrawer
        open={infoOpen}
        onOpenChange={setInfoOpen}
        billetera={selectedBilletera}
        onEdit={handleEditFromInfo}
        onTransfer={handleTransferFromInfo}
      />

      <TransferDrawer
        open={transferOpen}
        onOpenChange={setTransferOpen}
        billeteras={billeteras}
        preselectedId={preselectedTransferId}
      />

      <CardDeleteConfirm
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        billetera={selectedBilletera}
      />

      {/* Expuesto para uso externo desde dashboard */}
      <ContextualDrawer
        open={false}
        onOpenChange={() => {}}
        onAddWallet={handleCreate}
        onTransfer={() => handleTransfer()}
      />
    </>
  )
}
