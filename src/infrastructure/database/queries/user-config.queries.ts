/**
 * User Config Queries
 *
 * Queries para configuración de usuario (moneda principal, timezone, período, etc.)
 */

import { db } from '../kysely'
import type { UserConfigTable } from '../types'

/**
 * Tipo para actualización de configuración
 */
export type UpdateUserConfigData = {
  moneda_principal_id?: string
  monedas_habilitadas?: string[]
  timezone?: string
  locale?: string
  primer_dia_semana?: number
  tipo_periodo?: string
  dia_inicio_periodo?: number
}

/**
 * Obtener configuración de usuario
 */
export async function findUserConfig(userId: string) {
  return await db
    .selectFrom('user_config')
    .selectAll()
    .where('user_id', '=', userId)
    .executeTakeFirst()
}

/**
 * Crear configuración por defecto para usuario
 */
export async function createDefaultUserConfig(userId: string, monedaPrincipalId: string = 'CLP') {
  return await db
    .insertInto('user_config')
    .values({
      user_id: userId,
      moneda_principal_id: monedaPrincipalId,
      monedas_habilitadas: [monedaPrincipalId],
      timezone: 'America/Santiago',
      locale: 'es-CL',
      primer_dia_semana: 1,
      tipo_periodo: 'MENSUAL',
      dia_inicio_periodo: 1,
      created_at: new Date(),
      updated_at: new Date(),
    })
    .returningAll()
    .executeTakeFirstOrThrow()
}

/**
 * Actualizar configuración de usuario
 */
export async function updateUserConfig(userId: string, configData: UpdateUserConfigData) {
  return await db
    .updateTable('user_config')
    .set({
      ...configData,
      updated_at: new Date(),
    })
    .where('user_id', '=', userId)
    .returningAll()
    .executeTakeFirst()
}

/**
 * Agregar moneda habilitada
 */
export async function addMonedaHabilitada(userId: string, monedaId: string) {
  const config = await findUserConfig(userId)
  if (!config) return null

  const monedasActuales = config.monedas_habilitadas || []
  if (monedasActuales.includes(monedaId)) {
    return config // Ya está habilitada
  }

  return await updateUserConfig(userId, {
    monedas_habilitadas: [...monedasActuales, monedaId],
  })
}

/**
 * Remover moneda habilitada
 */
export async function removeMonedaHabilitada(userId: string, monedaId: string) {
  const config = await findUserConfig(userId)
  if (!config) return null

  // No permitir remover la moneda principal
  if (config.moneda_principal_id === monedaId) {
    throw new Error('No se puede desactivar la moneda principal')
  }

  const monedasActuales = config.monedas_habilitadas || []
  return await updateUserConfig(userId, {
    monedas_habilitadas: monedasActuales.filter((id) => id !== monedaId),
  })
}
