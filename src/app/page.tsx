/**
 * Home Page
 *
 * Página principal de la aplicación
 * Redirige al locale por defecto
 */

import { redirect } from 'next/navigation'
import { getSession } from '@/infrastructure/lib/auth'
import { defaultLocale } from '@/i18n/config'

export default async function HomePage() {
  const session = await getSession()

  // Si está autenticado, redirigir al dashboard
  if (session?.user) {
    redirect(`/${defaultLocale}/dashboard`)
  }

  // Si no está autenticado, redirigir al login
  redirect(`/${defaultLocale}/auth/login`)
}
