/**
 * /api/sobres
 *
 * API endpoints para gestión de sobres (envelopes/budgets)
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/infrastructure/lib/auth'
import {
  crearSobre,
  obtenerSobresUsuario,
} from '@/application/services/sobres.service'

/**
 * GET /api/sobres
 *
 * Obtener todos los sobres del usuario autenticado
 */
export async function GET() {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const result = await obtenerSobresUsuario(session.user.id)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      sobres: result.data,
    })
  } catch (error: any) {
    console.error('Error al obtener sobres:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/sobres
 *
 * Crear un nuevo sobre
 *
 * Body:
 * {
 *   nombre: string (requerido)
 *   tipo: TipoSobre (requerido) - GASTO | AHORRO | DEUDA
 *   presupuestoAsignado: number (requerido)
 *   monedaPrincipalId?: string
 *   color?: string
 *   emoji?: string
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { nombre, tipo, presupuestoAsignado, monedaPrincipalId, color, emoji } = body

    // Validaciones
    if (!nombre || !tipo || presupuestoAsignado === undefined) {
      return NextResponse.json(
        { error: 'Campos requeridos: nombre, tipo, presupuestoAsignado' },
        { status: 400 }
      )
    }

    const result = await crearSobre({
      nombre,
      tipo,
      presupuestoAsignado,
      monedaPrincipalId,
      color,
      emoji,
      userId: session.user.id,
    })

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json(
      {
        success: true,
        sobre: result.data,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Error al crear sobre:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
