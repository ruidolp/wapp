/**
 * Locale Layout with i18n support
 *
 * Este layout envuelve toda la aplicación y provee:
 * - next-intl provider para traducciones
 * - SessionProvider para autenticación
 * - Configuración de idioma
 * - HTML y body tags
 */

import { NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { hasLocale } from 'next-intl'
import { notFound } from 'next/navigation'
import { Inter } from 'next/font/google'
import type { Metadata } from 'next'
import { routing } from '@/i18n/routing'
import { SessionProvider } from '@/presentation/providers/session-provider'
import { Toaster } from '@/components/ui/toaster'
import '@/app/globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'WApp - Aplicación Full Stack',
  description: 'Next.js + Kysely + NextAuth + Capacitor',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'WApp',
  },
  formatDetection: {
    telephone: false,
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  // Validar que el locale sea válido
  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  // Enable static rendering
  setRequestLocale(locale)

  // Obtener las traducciones para este locale
  const messages = await getMessages()

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={inter.className}>
        <SessionProvider>
          <NextIntlClientProvider messages={messages}>
            {children}
            <Toaster />
          </NextIntlClientProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
