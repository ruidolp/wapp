/**
 * Middleware de Next.js
 *
 * Se ejecuta en todas las requests antes de renderizar la página.
 * Responsabilidades:
 * - i18n (internacionalización)
 * - Protección de rutas autenticadas
 * - Detección de plataforma (mobile/desktop/Capacitor)
 * - Redirecciones según contexto
 * - Headers de seguridad
 */

import createMiddleware from 'next-intl/middleware'
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/infrastructure/lib/auth'
import { appConfig } from '@/infrastructure/config/app.config'
import { locales, defaultLocale } from './i18n/config'

// Middleware de i18n
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always', // Siempre incluir el locale en la URL
})

// Rutas que no requieren i18n
const publicPatterns = [
  '/api',
  '/_next',
  '/favicon.ico',
  '/public',
]

/**
 * Middleware principal que combina i18n + auth
 */
export default auth(async (request) => {
  const { pathname } = request.nextUrl

  // Skip i18n para rutas públicas (API, static, etc)
  const isPublicPattern = publicPatterns.some((pattern) =>
    pathname.startsWith(pattern)
  )

  if (isPublicPattern) {
    return NextResponse.next()
  }

  // Aplicar i18n middleware primero
  const intlResponse = intlMiddleware(request)

  // Si i18n redirige (ej: / -> /en), retornar esa redirección
  if (intlResponse.status === 307 || intlResponse.status === 308) {
    return intlResponse
  }

  // Extraer locale del pathname (ej: /en/dashboard -> en)
  const pathnameLocale = pathname.split('/')[1]
  const locale = locales.includes(pathnameLocale as any) ? pathnameLocale : defaultLocale

  // Detectar si la request viene de Capacitor
  const isCapacitor = detectCapacitor(request)
  const isMobile = detectMobile(request)

  // Autenticación
  const isAuthenticated = !!request.auth

  // Log en desarrollo
  if (appConfig.environment.isDevelopment) {
    console.log('Middleware:', {
      pathname,
      locale,
      isAuthenticated,
      isCapacitor,
      isMobile,
    })
  }

  // Remover el locale del path para verificar rutas
  const pathnameWithoutLocale = pathname.replace(`/${locale}`, '') || '/'

  // Verificar si es una ruta pública
  const isPublicRoute = appConfig.routes.public.some(
    (route) => pathnameWithoutLocale.startsWith(route) || pathnameWithoutLocale === route
  )

  // Verificar si es una ruta protegida
  const isProtectedRoute = appConfig.routes.protected.some(
    (route) => pathnameWithoutLocale.startsWith(route) || pathnameWithoutLocale === route
  )

  // Si es una ruta protegida y no está autenticado, redirigir a login
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL(`/${locale}/auth/login`, request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Si está autenticado e intenta acceder a login/register, redirigir al dashboard
  if (
    isAuthenticated &&
    (pathnameWithoutLocale === '/auth/login' || pathnameWithoutLocale === '/auth/register')
  ) {
    return NextResponse.redirect(new URL(`/${locale}${appConfig.routes.afterLogin}`, request.url))
  }

  // Agregar headers personalizados
  const response = NextResponse.next()

  // Headers de seguridad (OWASP recomendado)
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'SAMEORIGIN')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  )

  // Content Security Policy básica
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

  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
}

/**
 * Configuración del matcher
 */
export const config = {
  matcher: [
    // Match all pathnames except for
    // - … if they start with `/api`, `/_next` or `/_vercel`
    // - … the ones containing a dot (e.g. `favicon.ico`)
    '/((?!api|_next|_vercel|.*\\..*).*)',
  ],
}
