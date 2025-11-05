/**
 * Root Layout with i18n support
 *
 * Este layout envuelve toda la aplicación y provee:
 * - next-intl provider para traducciones
 * - Configuración de idioma
 * - Metadata dinámica según locale
 */

import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { Inter } from 'next/font/google'
import { locales } from '@/i18n/config'
import { Toaster } from '@/components/ui/toaster'
import '@/app/globals.css'

const inter = Inter({ subsets: ['latin'] })

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  // Validar que el locale sea válido
  if (!locales.includes(locale as any)) {
    notFound()
  }

  // Obtener las traducciones para este locale
  const messages = await getMessages()

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={inter.className}>
        <NextIntlClientProvider messages={messages}>
          {children}
          <Toaster />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
