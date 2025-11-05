/**
 * Home Page
 *
 * Página principal de la aplicación
 */

import { redirect } from 'next/navigation'
import { getSession } from '@/infrastructure/lib/auth'

export default async function HomePage() {
  const session = await getSession()

  // Si está autenticado, redirigir al dashboard
  if (session?.user) {
    redirect('/dashboard')
  }

  // Si no está autenticado, redirigir al login
  redirect('/auth/login')
}
