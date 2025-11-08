/**
 * /api/sobres/[id]/categorias
 *
 * API endpoints para gestión de categorías vinculadas a sobres
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/infrastructure/lib/auth'
import {
  obtenerCategoriasSobre,
  vincularCategorias,
} from '@/application/services/sobres.service'

/**
 * GET /api/sobres/[id]/categorias
 *
 * Obtener todas las categorías vinculadas a un sobre
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

    const { id } = await context.params

    const result = await obtenerCategoriasSobre(id, session.user.id)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      categorias: result.data,
    })
  } catch (error: any) {
    console.error('Error al obtener categorías:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/sobres/[id]/categorias
 *
 * Vincular categorías a un sobre
 *
 * Body:
 * {
 *   categoriaIds: string[] (requerido) - Array de IDs de categorías
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

    const { id } = await context.params
    const body = await req.json()
    const { categoriaIds } = body

    // Validaciones
    if (!categoriaIds || !Array.isArray(categoriaIds) || categoriaIds.length === 0) {
      return NextResponse.json(
        { error: 'categoriaIds debe ser un array con al menos un ID' },
        { status: 400 }
      )
    }

    const result = await vincularCategorias(id, session.user.id, categoriaIds)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: 'Categorías vinculadas correctamente',
    })
  } catch (error: any) {
    console.error('Error al vincular categorías:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
