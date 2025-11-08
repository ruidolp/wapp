/**
 * Sobres Queries
 *
 * Queries para gestión de sobres (presupuesto virtual)
 */

import { db } from '../kysely'
import type { SobresTable, SobresUsuariosTable } from '../types'

/**
 * Tipo para creación de sobre
 */
export type CreateSobreData = {
  nombre: string
  tipo: string // TipoSobre enum
  moneda_principal_id: string
  presupuesto_asignado?: number
  gastado?: number
  color?: string
  emoji?: string
  is_compartido: boolean
  max_participantes: number
  usuario_id: string
}

/**
 * Tipo para actualización de sobre
 */
export type UpdateSobreData = {
  nombre?: string
  presupuesto_asignado?: number
  gastado?: number
  color?: string
  emoji?: string
}

/**
 * Buscar sobre por ID (sin soft-deleted)
 */
export async function findSobreById(sobreId: string) {
  return await db
    .selectFrom('sobres')
    .selectAll()
    .where('id', '=', sobreId)
    .where('deleted_at', 'is', null)
    .executeTakeFirst()
}

/**
 * Buscar sobres por usuario (como owner o participante)
 */
export async function findSobresByUser(userId: string) {
  // Sobres propios + sobres compartidos donde participa
  const sobresOwner = await db
    .selectFrom('sobres')
    .selectAll()
    .where('usuario_id', '=', userId)
    .where('deleted_at', 'is', null)
    .execute()

  const sobresParticipante = await db
    .selectFrom('sobres')
    .innerJoin('sobres_usuarios', 'sobres.id', 'sobres_usuarios.sobre_id')
    .selectAll('sobres')
    .where('sobres_usuarios.usuario_id', '=', userId)
    .where('sobres.deleted_at', 'is', null)
    .execute()

  // Combinar y eliminar duplicados
  const allSobres = [...sobresOwner, ...sobresParticipante]
  const uniqueSobres = Array.from(new Map(allSobres.map((s) => [s.id, s])).values())

  return uniqueSobres.sort((a, b) => b.created_at.getTime() - a.created_at.getTime())
}

/**
 * Buscar sobres compartidos donde el usuario participa
 */
export async function findSobresCompartidosByUser(userId: string) {
  return await db
    .selectFrom('sobres')
    .innerJoin('sobres_usuarios', 'sobres.id', 'sobres_usuarios.sobre_id')
    .selectAll('sobres')
    .where('sobres_usuarios.usuario_id', '=', userId)
    .where('sobres.is_compartido', '=', true)
    .where('sobres.deleted_at', 'is', null)
    .execute()
}

/**
 * Crear nuevo sobre
 */
export async function createSobre(sobreData: CreateSobreData) {
  return await db
    .insertInto('sobres')
    .values({
      ...sobreData,
      created_at: new Date(),
      updated_at: new Date(),
    })
    .returningAll()
    .executeTakeFirstOrThrow()
}

/**
 * Actualizar sobre
 */
export async function updateSobre(sobreId: string, sobreData: UpdateSobreData) {
  return await db
    .updateTable('sobres')
    .set({
      ...sobreData,
      updated_at: new Date(),
    })
    .where('id', '=', sobreId)
    .where('deleted_at', 'is', null)
    .returningAll()
    .executeTakeFirst()
}

/**
 * Soft delete de sobre
 */
export async function softDeleteSobre(sobreId: string) {
  return await db
    .updateTable('sobres')
    .set({
      deleted_at: new Date(),
      updated_at: new Date(),
    })
    .where('id', '=', sobreId)
    .where('deleted_at', 'is', null)
    .executeTakeFirst()
}

/**
 * Actualizar presupuesto asignado de sobre
 */
export async function updateSobrePresupuesto(sobreId: string, nuevoPresupuesto: number) {
  return await db
    .updateTable('sobres')
    .set({
      presupuesto_asignado: nuevoPresupuesto,
      updated_at: new Date(),
    })
    .where('id', '=', sobreId)
    .where('deleted_at', 'is', null)
    .returningAll()
    .executeTakeFirst()
}

/**
 * Actualizar gastado de sobre
 */
export async function updateSobreGastado(sobreId: string, nuevoGastado: number) {
  return await db
    .updateTable('sobres')
    .set({
      gastado: nuevoGastado,
      updated_at: new Date(),
    })
    .where('id', '=', sobreId)
    .where('deleted_at', 'is', null)
    .returningAll()
    .executeTakeFirst()
}

/**
 * Incrementar gastado de sobre (útil para transacciones)
 */
export async function incrementarSobreGastado(sobreId: string, monto: number) {
  const sobre = await findSobreById(sobreId)
  if (!sobre) return null

  const nuevoGastado = (sobre.gastado || 0) + monto
  return await updateSobreGastado(sobreId, nuevoGastado)
}

/**
 * SOBRES_USUARIOS (participantes)
 */

/**
 * Agregar participante a sobre compartido
 */
export async function addParticipanteToSobre(
  sobreId: string,
  userId: string,
  rol: string = 'CONTRIBUTOR',
  presupuestoAsignado: number = 0
) {
  return await db
    .insertInto('sobres_usuarios')
    .values({
      sobre_id: sobreId,
      usuario_id: userId,
      presupuesto_asignado: presupuestoAsignado,
      gastado: 0,
      rol,
      created_at: new Date(),
    })
    .returningAll()
    .executeTakeFirstOrThrow()
}

/**
 * Obtener participantes de un sobre
 */
export async function findParticipantesBySobre(sobreId: string) {
  return await db
    .selectFrom('sobres_usuarios')
    .selectAll()
    .where('sobre_id', '=', sobreId)
    .execute()
}

/**
 * Obtener tracking individual de usuario en sobre compartido
 */
export async function findParticipanteInSobre(sobreId: string, userId: string) {
  return await db
    .selectFrom('sobres_usuarios')
    .selectAll()
    .where('sobre_id', '=', sobreId)
    .where('usuario_id', '=', userId)
    .executeTakeFirst()
}

/**
 * Actualizar tracking de participante (presupuesto y gastado)
 */
export async function updateParticipanteTracking(
  sobreId: string,
  userId: string,
  presupuestoAsignado?: number,
  gastado?: number
) {
  const updates: Partial<SobresUsuariosTable> = {}
  if (presupuestoAsignado !== undefined) updates.presupuesto_asignado = presupuestoAsignado
  if (gastado !== undefined) updates.gastado = gastado

  return await db
    .updateTable('sobres_usuarios')
    .set(updates)
    .where('sobre_id', '=', sobreId)
    .where('usuario_id', '=', userId)
    .returningAll()
    .executeTakeFirst()
}

/**
 * Incrementar gastado de participante
 */
export async function incrementarParticipanteGastado(sobreId: string, userId: string, monto: number) {
  const participante = await findParticipanteInSobre(sobreId, userId)
  if (!participante) return null

  const nuevoGastado = participante.gastado + monto
  return await updateParticipanteTracking(sobreId, userId, undefined, nuevoGastado)
}

/**
 * Remover participante de sobre
 */
export async function removeParticipanteFromSobre(sobreId: string, userId: string) {
  return await db
    .deleteFrom('sobres_usuarios')
    .where('sobre_id', '=', sobreId)
    .where('usuario_id', '=', userId)
    .executeTakeFirst()
}
