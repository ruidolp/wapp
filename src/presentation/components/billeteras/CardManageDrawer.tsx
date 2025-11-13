/**
 * CardManageDrawer - Crear/Editar billetera unificado
 */

import { useTranslations } from 'next-intl'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import {
  useCreateBilletera,
  useUpdateBilletera,
  type Billetera,
} from '@/presentation/hooks/useBilleteras'

interface CardManageDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  billetera?: Billetera | null
}

const TIPOS = ['DEBITO', 'CREDITO', 'EFECTIVO', 'AHORRO', 'INVERSION'] as const

export function CardManageDrawer({
  open,
  onOpenChange,
  billetera,
}: CardManageDrawerProps) {
  const t = useTranslations('billeteras')
  const isEdit = !!billetera

  const createMutation = useCreateBilletera()
  const updateMutation = useUpdateBilletera()

  // Form state
  const [nombre, setNombre] = useState('')
  const [tipo, setTipo] = useState<typeof TIPOS[number]>('DEBITO')
  const [isCompartida, setIsCompartida] = useState(false)
  const [saldoInicial, setSaldoInicial] = useState('')

  // Reset form cuando abre/cierra o cambia billetera
  useEffect(() => {
    if (open) {
      if (billetera) {
        setNombre(billetera.nombre)
        setTipo(billetera.tipo)
        setIsCompartida(billetera.is_compartida)
        setSaldoInicial('')
      } else {
        setNombre('')
        setTipo('DEBITO')
        setIsCompartida(false)
        setSaldoInicial('')
      }
    }
  }, [open, billetera])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isEdit && billetera) {
      // Actualizar billetera
      await updateMutation.mutateAsync({
        id: billetera.id,
        nombre,
        tipo,
        is_compartida: isCompartida,
      })
    } else {
      // Crear billetera
      await createMutation.mutateAsync({
        nombre,
        tipo,
        saldo_inicial: parseFloat(saldoInicial) || 0,
        is_compartida: isCompartida,
      })
    }

    onOpenChange(false)
  }

  const loading = createMutation.isPending || updateMutation.isPending

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>
            {isEdit ? t('edit.title') : t('create.title')}
          </DrawerTitle>
          <DrawerDescription>
            {isEdit ? billetera?.nombre : t('emptyDescription')}
          </DrawerDescription>
        </DrawerHeader>

        <form onSubmit={handleSubmit} className="px-4 space-y-4">
          {/* Nombre */}
          <div className="space-y-2">
            <Label htmlFor="nombre">
              {t('fields.name')} <span className="text-red-500">*</span>
            </Label>
            <Input
              id="nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder={t('fields.namePlaceholder')}
              required
            />
          </div>

          {/* Tipo */}
          <div className="space-y-2">
            <Label htmlFor="tipo">
              {t('fields.type')} <span className="text-red-500">*</span>
            </Label>
            <Select value={tipo} onValueChange={(v) => setTipo(v as typeof TIPOS[number])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIPOS.map((t_tipo) => (
                  <SelectItem key={t_tipo} value={t_tipo}>
                    {t(`types.${t_tipo}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Compartida */}
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
              <Label>{t('fields.shared')}</Label>
              <p className="text-sm text-muted-foreground">
                {t('fields.sharedDescription')}
              </p>
            </div>
            <Switch checked={isCompartida} onCheckedChange={setIsCompartida} />
          </div>

          {/* Saldo Inicial (solo crear) */}
          {!isEdit && (
            <div className="space-y-2">
              <Label htmlFor="saldoInicial">
                {t('fields.initialBalance')} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="saldoInicial"
                type="number"
                step="0.01"
                value={saldoInicial}
                onChange={(e) => setSaldoInicial(e.target.value)}
                placeholder={t('fields.initialBalancePlaceholder')}
                required
              />
            </div>
          )}

          <DrawerFooter className="px-0 pt-4 pb-2">
            <Button type="submit" disabled={loading} className="w-full">
              {loading
                ? isEdit ? t('edit.submitting') : t('create.submitting')
                : isEdit ? t('edit.submit') : t('create.submit')}
            </Button>
            <DrawerClose asChild>
              <Button variant="outline" disabled={loading} className="w-full mb-4">
                {t('delete.cancel')}
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  )
}
