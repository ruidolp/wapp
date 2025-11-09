/**
 * Dashboard Page - Mobile Swipe Navigation
 * Navegación horizontal entre Billeteras y Sobres
 */

import { redirect } from 'next/navigation'
import { getSession } from '@/infrastructure/lib/auth'
import { DashboardClient } from './dashboard-client'
import {
  obtenerBilleterasUsuario,
} from '@/application/services/billeteras.service'
import {
  obtenerSobresUsuario,
} from '@/application/services/sobres.service'
import {
  obtenerTransacciones,
} from '@/application/services/transacciones.service'
import {
  findCategoriasBySobre,
} from '@/infrastructure/database/queries/categorias.queries'
import { findUserConfig } from '@/infrastructure/database/queries/user-config.queries'
import { toBilletera, toSobre, toTransaccion } from '@/infrastructure/database/mappers'

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const session = await getSession()

  if (!session?.user) {
    redirect(`/${locale}/auth/login`)
  }

  const userId = session.user.id

  // Verificar configuración del usuario
  const userConfig = await findUserConfig(userId)

  // Cargar billeteras
  const billeterasResult = await obtenerBilleterasUsuario(userId)
  const billeterasDb = billeterasResult.success ? billeterasResult.data : []
  const billeteras = billeterasDb.map(toBilletera)

  // Cargar sobres
  const sobresResult = await obtenerSobresUsuario(userId)
  const sobresDb = sobresResult.success ? sobresResult.data : []
  const sobres = sobresDb.map(toSobre)

  // Para cada sobre, cargar categorías y transacciones
  const sobresConDatos = await Promise.all(
    sobres.map(async (sobre: typeof sobres[0]) => {
      // Categorías del sobre
      const categoriasDb = await findCategoriasBySobre(sobre.id)

      // Transacciones del sobre (últimas 20)
      const transaccionesResult = await obtenerTransacciones(userId)

      const transaccionesDb = transaccionesResult.success
        ? transaccionesResult.data
            .filter((t: any) => t.sobre_id === sobre.id)
            .slice(0, 20)
        : []

      const transacciones = transaccionesDb.map(toTransaccion)

      // Calcular gastos por categoría
      const categorias = categoriasDb.map((cat: any) => {
        const gastado = transacciones
          .filter(
            (t: any) => t.categoria_id === cat.id && t.tipo === 'GASTO'
          )
          .reduce((sum: number, t: any) => sum + t.monto, 0)

        return {
          id: cat.id as string,
          nombre: cat.nombre,
          emoji: cat.emoji,
          color: cat.color || '#64748b',
          gastado,
          presupuesto: sobre.presupuesto_asignado,
        }
      })

      const totalGastado = transacciones
        .filter((t: any) => t.tipo === 'GASTO')
        .reduce((sum: number, t: any) => sum + t.monto, 0)

      return {
        sobre,
        categorias,
        transacciones,
        totalGastado,
      }
    })
  )

  return (
    <DashboardClient
      locale={locale}
      user={session.user}
      billeteras={billeteras}
      sobresConDatos={sobresConDatos}
      hasUserConfig={!!userConfig}
    />
  )
}
