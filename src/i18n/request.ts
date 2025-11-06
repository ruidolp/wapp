/**
 * i18n Request Configuration
 *
 * Configuración de next-intl para Server Components
 */

import { getRequestConfig } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { locales } from './config'

export default getRequestConfig(async ({ locale }) => {
  // Validar que el locale sea válido
  if (!locale || !locales.includes(locale as any)) {
    notFound()
  }

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  }
})
