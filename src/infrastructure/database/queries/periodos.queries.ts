/**
 * Periodos Queries
 *
 * Queries para gestión de períodos de presupuesto (semanal, quincenal, mensual, custom)
 */

import { db } from '../kysely'
import type { PeriodosTable, TipoPeriodo } from '../types'

/**
 * Tipo para crear período
 */
export type CreatePeriodoData = {
  nombre: string
  tipo: TipoPeriodo
  fecha_inicio: Date
  fecha_fin: Date
  usuario_id: string
}

/**
 * Buscar período por ID
 */
export async function findPeriodoById(periodoId: string) {
  return await db
    .selectFrom('periodos')
    .selectAll()
    .where('id', '=', periodoId)
    .where('deleted_at', 'is', null)
    .executeTakeFirst()
}

/**
 * Buscar períodos por usuario
 */
export async function findPeriodosByUser(userId: string) {
  return await db
    .selectFrom('periodos')
    .selectAll()
    .where('usuario_id', '=', userId)
    .where('deleted_at', 'is', null)
    .orderBy('fecha_inicio', 'desc')
    .execute()
}

/**
 * Buscar período activo (actual) del usuario
 */
export async function findPeriodoActivoByUser(userId: string) {
  const now = new Date()

  return await db
    .selectFrom('periodos')
    .selectAll()
    .where('usuario_id', '=', userId)
    .where('fecha_inicio', '<=', now)
    .where('fecha_fin', '>=', now)
    .where('deleted_at', 'is', null)
    .orderBy('fecha_inicio', 'desc')
    .executeTakeFirst()
}

/**
 * Crear período
 */
export async function createPeriodo(periodoData: CreatePeriodoData) {
  return await db
    .insertInto('periodos')
    .values({
      ...periodoData,
      created_at: new Date(),
      updated_at: new Date(),
    })
    .returningAll()
    .executeTakeFirstOrThrow()
}

/**
 * Soft delete período
 */
export async function softDeletePeriodo(periodoId: string) {
  return await db
    .updateTable('periodos')
    .set({
      deleted_at: new Date(),
      updated_at: new Date(),
    })
    .where('id', '=', periodoId)
    .returningAll()
    .executeTakeFirst()
}
