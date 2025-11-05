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

  // Headers de seguridad (OWASP recomendado)
  // Prevenir MIME sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff')

  // Prevenir clickjacking - permitir solo same-origin
  response.headers.set('X-Frame-Options', 'SAMEORIGIN')

  // Protección XSS (legacy, pero algunos navegadores aún lo usan)
  response.headers.set('X-XSS-Protection', '1; mode=block')

  // Política de referrer - no enviar información sensible
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  // Permissions Policy - deshabilitar APIs peligrosas
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  )

  // Content Security Policy (CSP) - Básico, ajustar según necesidades
  // NOTA: Next.js tiene su propio sistema de CSP, esto es un fallback
  if (!response.headers.has('Content-Security-Policy')) {
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'; " +
      "style-src 'self' 'unsafe-inline'; " +
      "img-src 'self' data: https:; " +
      "font-src 'self' data:; " +
      "connect-src 'self' https:; " +
      "frame-ancestors 'self'"
    )
  }

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
