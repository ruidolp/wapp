/**
 * /api/sobres/[id]/asignaciones
 *
 * Endpoints para gestión de asignaciones de presupuesto desde billeteras a sobres
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/infrastructure/lib/auth'
import {
  findSobreById,
  findParticipanteInSobre,
  findAsignacionesBySobre,
  createAsignacion,
  updateParticipanteTracking,
} from '@/infrastructure/database/queries/sobres.queries'
import { findBilleteraById, createBilleteraTransaccion } from '@/infrastructure/database/queries/billeteras.queries'

/**
 * GET /api/sobres/[id]/asignaciones
 *
 * Obtener todas las asignaciones de presupuesto del sobre
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: sobreId } = await context.params

    // Verificar que el sobre existe y el usuario tiene acceso
    const sobre = await findSobreById(sobreId)
    if (!sobre) {
      return NextResponse.json({ error: 'Sobre no encontrado' }, { status: 404 })
    }

    const participante = await findParticipanteInSobre(sobreId, session.user.id)
    if (!participante) {
      return NextResponse.json(
        { error: 'No tienes acceso a este sobre' },
        { status: 403 }
      )
    }

    // Obtener asignaciones
    const asignaciones = await findAsignacionesBySobre(sobreId)

    return NextResponse.json({
      success: true,
      asignaciones,
      sobre: {
        id: sobre.id,
        nombre: sobre.nombre,
        presupuesto_asignado: sobre.presupuesto_asignado,
        gastado: sobre.gastado,
        libre: sobre.presupuesto_asignado - (sobre.gastado || 0),
      },
    })
  } catch (error: any) {
    console.error('Error al obtener asignaciones:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/sobres/[id]/asignaciones
 *
 * Agregar presupuesto desde billetera a sobre
 *
 * Body:
 * {
 *   billeteraId: string (requerido)
 *   monto: number (requerido)
 *   descripcion?: string
 * }
 */
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: sobreId } = await context.params
    const { billeteraId, monto, descripcion } = await req.json()

    // Validaciones
    if (!billeteraId || !monto) {
      return NextResponse.json(
        { error: 'Campos requeridos: billeteraId, monto' },
        { status: 400 }
      )
    }

    if (monto <= 0) {
      return NextResponse.json(
        { error: 'El monto debe ser mayor a cero' },
        { status: 400 }
      )
    }

    // Verificar que el sobre existe y el usuario tiene acceso
    const sobre = await findSobreById(sobreId)
    if (!sobre) {
      return NextResponse.json({ error: 'Sobre no encontrado' }, { status: 404 })
    }

    const participante = await findParticipanteInSobre(sobreId, session.user.id)
    if (!participante) {
      return NextResponse.json(
        { error: 'No tienes acceso a este sobre' },
        { status: 403 }
      )
    }

    // Verificar que la billetera pertenece al usuario
    const billetera = await findBilleteraById(billeteraId)
    if (!billetera) {
      return NextResponse.json({ error: 'Billetera no encontrada' }, { status: 404 })
    }

    if (billetera.usuario_id !== session.user.id) {
      return NextResponse.json(
        { error: 'No tienes permiso para usar esta billetera' },
        { status: 403 }
      )
    }

    // Crear asignación
    const asignacion = await createAsignacion(
      sobreId,
      billeteraId,
      session.user.id,
      monto,
      billetera.moneda_principal_id,
      'INICIAL'
    )

    // Actualizar tracking del participante en el sobre
    const nuevoPresupuesto = participante.presupuesto_asignado + monto
    await updateParticipanteTracking(sobreId, session.user.id, nuevoPresupuesto)

    // Registrar en billeteras_transacciones (solo registra, no debita)
    await createBilleteraTransaccion(
      billeteraId,
      session.user.id,
      'ASIGNACION_SOBRE',
      monto,
      billetera.moneda_principal_id,
      billetera.saldo_real, // No cambia, solo se reserva
      null,
      null,
      `Asignado a sobre: ${sobre.nombre}`
    )

    return NextResponse.json(
      {
        success: true,
        asignacion,
        message: `Se asignaron $${monto} a ${sobre.nombre}`,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Error al crear asignación:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
