/**
 * Root Layout
 *
 * Con next-intl, este layout solo pasa children.
 * El HTML y body se renderizan en [locale]/layout.tsx
 */

import type { Metadata } from 'next'

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
  return children
}
