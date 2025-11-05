/**
 * Middleware de Next.js
 *
 * Se ejecuta en todas las requests antes de renderizar la página.
 * Responsabilidades:
 * - Protección de rutas autenticadas
 * - Detección de plataforma (mobile/desktop/Capacitor)
 * - Redirecciones según contexto
 * - Headers de seguridad
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/infrastructure/lib/auth'
import { appConfig } from '@/infrastructure/config/app.config'

/**
 * Middleware principal
 */
export default auth((request) => {
  const { pathname } = request.nextUrl
  const isAuthenticated = !!request.auth

  // Detectar si la request viene de Capacitor
  const isCapacitor = detectCapacitor(request)
  const isMobile = detectMobile(request)

  // Log en desarrollo
  if (appConfig.environment.isDevelopment) {
    console.log('Middleware:', {
      pathname,
      isAuthenticated,
      isCapacitor,
      isMobile,
    })
  }

  // Verificar si es una ruta pública
  const isPublicRoute = appConfig.routes.public.some((route) =>
    pathname.startsWith(route) || pathname === route
  )

  // Verificar si es una ruta protegida
  const isProtectedRoute = appConfig.routes.protected.some((route) =>
    pathname.startsWith(route) || pathname === route
  )

  // Si es una ruta protegida y no está autenticado, redirigir a login
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Si está autenticado e intenta acceder a login/register, redirigir al dashboard
  if (isAuthenticated && (pathname === '/auth/login' || pathname === '/auth/register')) {
    return NextResponse.redirect(
      new URL(appConfig.routes.afterLogin, request.url)
    )
  }

  // Agregar headers personalizados
  const response = NextResponse.next()

  // Headers para Capacitor
  if (isCapacitor) {
    response.headers.set('X-Platform', 'capacitor')
    response.headers.set('Access-Control-Allow-Origin', 'capacitor://localhost')
    response.headers.set('Access-Control-Allow-Origin', 'ionic://localhost')
  }

  // Headers para mobile
  if (isMobile) {
    response.headers.set('X-Device', 'mobile')
  }

  return response
})

/**
 * Detectar si la request viene de Capacitor
 */
function detectCapacitor(request: NextRequest): boolean {
  const userAgent = request.headers.get('user-agent') || ''
  const origin = request.headers.get('origin') || ''

  return (
    origin.includes('capacitor://') ||
    origin.includes('ionic://') ||
    userAgent.includes('Capacitor')
  )
}

/**
 * Detectar si es un dispositivo móvil
 */
function detectMobile(request: NextRequest): boolean {
  const userAgent = request.headers.get('user-agent') || ''

  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    userAgent
  )
}

/**
 * Configuración del matcher
 * Define qué rutas deben pasar por el middleware
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}
