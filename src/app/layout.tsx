/**
 * Root Layout
 *
 * Layout principal de la aplicación Next.js
 */

import type { Metadata } from 'next'
import './globals.css'

import { SessionProvider } from '@/presentation/providers/session-provider'
import { Toaster } from '@/components/ui/toaster'

export const metadata: Metadata = {
  title: 'WApp - Aplicación Full Stack',
  description: 'Next.js + Prisma + NextAuth + Capacitor',
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        <SessionProvider>
          {children}
          <Toaster />
        </SessionProvider>
      </body>
    </html>
  )
}
