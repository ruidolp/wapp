/**
 * Servicio de Transacciones
 *
 * Contiene la lógica de negocio para gestión de transacciones:
 * - Crear, actualizar, eliminar transacciones
 * - Consultar por tipo, fecha, billetera, sobre, categoría
 * - Estadísticas y totales
 * - Actualización automática de saldos
 * - Validación de reglas de negocio
 */

import {
  createTransaccion,
  findTransaccionById,
  findTransaccionesByUser,
  findTransaccionesByBilletera,
  findTransaccionesBySobre,
  findTransaccionesByCategoria,
  findTransaccionesByTipo,
  updateTransaccion,
  softDeleteTransaccion,
  calcularTotalGastosBySobre,
  calcularTotalesByUser,
} from '@/infrastructure/database/queries/transacciones.queries'
import { findBilleteraById, updateBilleteraSaldos } from '@/infrastructure/database/queries/billeteras.queries'
import { findSobreById } from '@/infrastructure/database/queries/sobres.queries'
import { findCategoriaById } from '@/infrastructure/database/queries/categorias.queries'
import type { TipoTransaccion } from '@/infrastructure/database/types'

/**
 * Datos para crear una transacción
 */
export interface CreateTransaccionInput {
  monto: number
  monedaId: string
  billeteraId: string
  tipo: TipoTransaccion
  descripcion?: string
  fecha: Date
  sobreId?: string
  categoriaId?: string
  subcategoriaId?: string
  userId: string
}

/**
 * Datos para actualizar una transacción
 */
export interface UpdateTransaccionInput {
  monto?: number
  descripcion?: string
  fecha?: Date
  sobreId?: string
  categoriaId?: string
  subcategoriaId?: string
}

/**
 * Filtros para búsqueda de transacciones
 */
export interface TransaccionFilters {
  tipo?: TipoTransaccion
  billeteraId?: string
  sobreId?: string
  categoriaId?: string
  fechaInicio?: Date
  fechaFin?: Date
}

/**
 * Resultado de operación
 */
export interface TransaccionResult {
  success: boolean
  data?: any
  error?: string
}

/**
 * Crear una nueva transacción
 */
export async function crearTransaccion(
  input: CreateTransaccionInput
): Promise<TransaccionResult> {
  try {
    const {
      monto,
      monedaId,
      billeteraId,
      tipo,
      descripcion,
      fecha,
      sobreId,
      categoriaId,
      subcategoriaId,
      userId,
    } = input

    // Validar monto
    if (monto <= 0) {
      return {
        success: false,
        error: 'El monto debe ser mayor a cero',
      }
    }

    // Validar tipo de transacción
    const tiposValidos: TipoTransaccion[] = [
      'GASTO',
      'INGRESO',
      'TRANSFERENCIA',
      'DEPOSITO',
      'PAGO_TC',
      'AJUSTE',
    ]
    if (!tiposValidos.includes(tipo)) {
      return {
        success: false,
        error: 'Tipo de transacción no válido',
      }
    }

    // Validar que la billetera existe y pertenece al usuario
    const billetera = await findBilleteraById(billeteraId)
    if (!billetera) {
      return {
        success: false,
        error: 'Billetera no encontrada',
      }
    }
    if (billetera.usuario_id !== userId) {
      return {
        success: false,
        error: 'No tienes permiso para usar esta billetera',
      }
    }

    // Validar sobre si se proporciona
    if (sobreId) {
      const sobre = await findSobreById(sobreId)
      if (!sobre) {
        return {
          success: false,
          error: 'Sobre no encontrado',
        }
      }
    }

    // Validar categoría si se proporciona
    if (categoriaId) {
      const categoria = await findCategoriaById(categoriaId)
      if (!categoria) {
        return {
          success: false,
          error: 'Categoría no encontrada',
        }
      }
    }

    // Crear transacción
    const transaccion = await createTransaccion({
      monto,
      moneda_id: monedaId,
      billetera_id: billeteraId,
      tipo,
      descripcion: descripcion || '',
      fecha,
      sobre_id: sobreId,
      categoria_id: categoriaId,
      subcategoria_id: subcategoriaId,
      usuario_id: userId,
    })

    // Actualizar saldo de billetera según tipo de transacción
    await actualizarSaldoBilletera(billeteraId, tipo, monto)

    return {
      success: true,
      data: transaccion,
    }
  } catch (error) {
    console.error('Error al crear transacción:', error)
    return {
      success: false,
      error: 'Error al crear la transacción',
    }
  }
}

/**
 * Actualizar saldo de billetera según tipo de transacción
 */
async function actualizarSaldoBilletera(
  billeteraId: string,
  tipo: TipoTransaccion,
  monto: number
) {
  const billetera = await findBilleteraById(billeteraId)
  if (!billetera) return

  let nuevoSaldoReal = Number(billetera.saldo_real)
  let nuevoSaldoProyectado = Number(billetera.saldo_proyectado)

  // Tipos que aumentan el saldo
  if (tipo === 'INGRESO' || tipo === 'DEPOSITO') {
    nuevoSaldoReal += monto
    nuevoSaldoProyectado += monto
  }

  // Tipos que disminuyen el saldo
  if (tipo === 'GASTO' || tipo === 'TRANSFERENCIA' || tipo === 'PAGO_TC') {
    nuevoSaldoReal -= monto
    nuevoSaldoProyectado -= monto
  }

  // AJUSTE puede ser positivo o negativo (se maneja en la lógica de creación)

  await updateBilleteraSaldos(billeteraId, nuevoSaldoReal, nuevoSaldoProyectado)
}

/**
 * Obtener todas las transacciones del usuario con filtros
 */
export async function obtenerTransacciones(
  userId: string,
  filters?: TransaccionFilters
): Promise<TransaccionResult> {
  try {
    let transacciones

    if (filters?.tipo) {
      transacciones = await findTransaccionesByTipo(
        userId,
        filters.tipo,
        filters.fechaInicio,
        filters.fechaFin
      )
    } else if (filters?.billeteraId) {
      transacciones = await findTransaccionesByBilletera(
        filters.billeteraId,
        filters.fechaInicio,
        filters.fechaFin
      )
    } else if (filters?.sobreId) {
      transacciones = await findTransaccionesBySobre(
        filters.sobreId,
        filters.fechaInicio,
        filters.fechaFin
      )
    } else if (filters?.categoriaId) {
      transacciones = await findTransaccionesByCategoria(
        filters.categoriaId,
        filters.fechaInicio,
        filters.fechaFin
      )
    } else {
      transacciones = await findTransaccionesByUser(
        userId,
        filters?.fechaInicio,
        filters?.fechaFin
      )
    }

    return {
      success: true,
      data: transacciones,
    }
  } catch (error) {
    console.error('Error al obtener transacciones:', error)
    return {
      success: false,
      error: 'Error al obtener transacciones',
    }
  }
}

/**
 * Obtener una transacción por ID
 */
export async function obtenerTransaccion(
  transaccionId: string,
  userId: string
): Promise<TransaccionResult> {
  try {
    const transaccion = await findTransaccionById(transaccionId)

    if (!transaccion) {
      return {
        success: false,
        error: 'Transacción no encontrada',
      }
    }

    // Verificar que la transacción pertenece al usuario
    if (transaccion.usuario_id !== userId) {
      return {
        success: false,
        error: 'No tienes permiso para acceder a esta transacción',
      }
    }

    return {
      success: true,
      data: transaccion,
    }
  } catch (error) {
    console.error('Error al obtener transacción:', error)
    return {
      success: false,
      error: 'Error al obtener la transacción',
    }
  }
}

/**
 * Actualizar una transacción
 */
export async function actualizarTransaccion(
  transaccionId: string,
  userId: string,
  input: UpdateTransaccionInput
): Promise<TransaccionResult> {
  try {
    // Verificar que la transacción existe y pertenece al usuario
    const transaccionResult = await obtenerTransaccion(transaccionId, userId)
    if (!transaccionResult.success) {
      return transaccionResult
    }

    const transaccionOriginal = transaccionResult.data

    // Validar monto si se proporciona
    if (input.monto !== undefined && input.monto <= 0) {
      return {
        success: false,
        error: 'El monto debe ser mayor a cero',
      }
    }

    const updateData: any = {}
    if (input.monto !== undefined) updateData.monto = input.monto
    if (input.descripcion !== undefined) updateData.descripcion = input.descripcion
    if (input.fecha !== undefined) updateData.fecha = input.fecha
    if (input.sobreId !== undefined) updateData.sobre_id = input.sobreId
    if (input.categoriaId !== undefined) updateData.categoria_id = input.categoriaId
    if (input.subcategoriaId !== undefined) updateData.subcategoria_id = input.subcategoriaId

    const transaccion = await updateTransaccion(transaccionId, updateData)

    // Si cambió el monto, actualizar saldos
    if (input.monto !== undefined && input.monto !== transaccionOriginal.monto) {
      // Revertir el efecto del monto original
      await revertirSaldoBilletera(
        transaccionOriginal.billetera_id,
        transaccionOriginal.tipo,
        Number(transaccionOriginal.monto)
      )
      // Aplicar el nuevo monto
      await actualizarSaldoBilletera(
        transaccionOriginal.billetera_id,
        transaccionOriginal.tipo,
        input.monto
      )
    }

    return {
      success: true,
      data: transaccion,
    }
  } catch (error) {
    console.error('Error al actualizar transacción:', error)
    return {
      success: false,
      error: 'Error al actualizar la transacción',
    }
  }
}

/**
 * Revertir el efecto de una transacción en el saldo
 */
async function revertirSaldoBilletera(
  billeteraId: string,
  tipo: TipoTransaccion,
  monto: number
) {
  const billetera = await findBilleteraById(billeteraId)
  if (!billetera) return

  let nuevoSaldoReal = Number(billetera.saldo_real)
  let nuevoSaldoProyectado = Number(billetera.saldo_proyectado)

  // Revertir tipos que aumentan el saldo
  if (tipo === 'INGRESO' || tipo === 'DEPOSITO') {
    nuevoSaldoReal -= monto
    nuevoSaldoProyectado -= monto
  }

  // Revertir tipos que disminuyen el saldo
  if (tipo === 'GASTO' || tipo === 'TRANSFERENCIA' || tipo === 'PAGO_TC') {
    nuevoSaldoReal += monto
    nuevoSaldoProyectado += monto
  }

  await updateBilleteraSaldos(billeteraId, nuevoSaldoReal, nuevoSaldoProyectado)
}

/**
 * Eliminar una transacción (soft delete)
 */
export async function eliminarTransaccion(
  transaccionId: string,
  userId: string
): Promise<TransaccionResult> {
  try {
    // Verificar que la transacción existe y pertenece al usuario
    const transaccionResult = await obtenerTransaccion(transaccionId, userId)
    if (!transaccionResult.success) {
      return transaccionResult
    }

    const transaccion = transaccionResult.data

    // Revertir el efecto en el saldo
    await revertirSaldoBilletera(
      transaccion.billetera_id,
      transaccion.tipo,
      Number(transaccion.monto)
    )

    await softDeleteTransaccion(transaccionId)

    return {
      success: true,
      data: { message: 'Transacción eliminada correctamente' },
    }
  } catch (error) {
    console.error('Error al eliminar transacción:', error)
    return {
      success: false,
      error: 'Error al eliminar la transacción',
    }
  }
}

/**
 * Obtener totales de ingresos y gastos del usuario en un período
 */
export async function obtenerTotales(
  userId: string,
  fechaInicio?: Date,
  fechaFin?: Date
): Promise<TransaccionResult> {
  try {
    const totales = await calcularTotalesByUser(userId, fechaInicio, fechaFin)

    return {
      success: true,
      data: totales,
    }
  } catch (error) {
    console.error('Error al obtener totales:', error)
    return {
      success: false,
      error: 'Error al obtener totales',
    }
  }
}

/**
 * Obtener total de gastos de un sobre en un período
 */
export async function obtenerGastosSobre(
  sobreId: string,
  userId: string,
  fechaInicio?: Date,
  fechaFin?: Date
): Promise<TransaccionResult> {
  try {
    // Verificar que el sobre existe
    const sobre = await findSobreById(sobreId)
    if (!sobre) {
      return {
        success: false,
        error: 'Sobre no encontrado',
      }
    }

    const totalGastos = await calcularTotalGastosBySobre(sobreId, fechaInicio, fechaFin)

    return {
      success: true,
      data: {
        sobre_id: sobreId,
        total_gastos: totalGastos,
        presupuesto: sobre.presupuesto_asignado,
        disponible: Number(sobre.presupuesto_asignado) - totalGastos,
        porcentaje_usado: (totalGastos / Number(sobre.presupuesto_asignado)) * 100,
      },
    }
  } catch (error) {
    console.error('Error al obtener gastos de sobre:', error)
    return {
      success: false,
      error: 'Error al obtener gastos',
    }
  }
}
