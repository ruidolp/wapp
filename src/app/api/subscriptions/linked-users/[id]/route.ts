/**
 * DELETE /api/subscriptions/linked-users/[id]
 *
 * Desvincular un usuario del plan.
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/infrastructure/lib/auth'
import { unlinkUserFromPlan } from '@/application/services/subscriptions'

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticación
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verificar que el usuario no está vinculado (solo owners pueden desvincular)
    // @ts-expect-error - Extended Session type
    if (session.user.subscription.isLinked) {
      return NextResponse.json(
        { error: 'You cannot unlink users while linked to another plan' },
        { status: 403 }
      )
    }

    const linkedUserId = params.id

    // Desvincular usuario
    await unlinkUserFromPlan(session.user.id, linkedUserId)

    return NextResponse.json({
      success: true,
      message: 'User unlinked successfully',
    })
  } catch (error: any) {
    console.error('Error unlinking user:', error)

    if (error.message === 'Linked user not found') {
      return NextResponse.json(
        { error: 'Linked user not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
