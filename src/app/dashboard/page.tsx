/**
 * Dashboard Page
 */

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession, signOut } from '@/infrastructure/lib/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default async function DashboardPage() {
  const session = await getSession()

  if (!session?.user) {
    redirect('/auth/login')
  }

  async function handleSignOut() {
    'use server'
    await signOut({ redirectTo: '/auth/login' })
  }

  return (
    <div className="min-h-screen bg-secondary/30 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Bienvenido, {session.user.name}
            </p>
          </div>

          <form action={handleSignOut}>
            <Button variant="outline">Cerrar Sesión</Button>
          </form>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Información del Usuario</CardTitle>
              <CardDescription>Datos de tu cuenta</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-sm font-medium">Nombre</p>
                <p className="text-sm text-muted-foreground">{session.user.name}</p>
              </div>
              {session.user.email && (
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{session.user.email}</p>
                </div>
              )}
              {session.user.phone && (
                <div>
                  <p className="text-sm font-medium">Teléfono</p>
                  <p className="text-sm text-muted-foreground">{session.user.phone}</p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium">Tipo de Cuenta</p>
                <p className="text-sm text-muted-foreground">{session.user.accountType}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Estadísticas</CardTitle>
              <CardDescription>Tu actividad</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Panel de estadísticas próximamente...
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
              <CardDescription>Tareas comunes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/showcase" className="block">
                <Button variant="outline" className="w-full">
                  Ver Showcase de Componentes
                </Button>
              </Link>
              <Button variant="outline" className="w-full">
                Ayuda
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Configuración del Proyecto</CardTitle>
            <CardDescription>Información técnica</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-medium">Framework</p>
                <p className="text-muted-foreground">Next.js 15 (App Router)</p>
              </div>
              <div>
                <p className="font-medium">Base de Datos</p>
                <p className="text-muted-foreground">PostgreSQL + Prisma</p>
              </div>
              <div>
                <p className="font-medium">Autenticación</p>
                <p className="text-muted-foreground">NextAuth v5</p>
              </div>
              <div>
                <p className="font-medium">UI</p>
                <p className="text-muted-foreground">Tailwind + shadcn/ui</p>
              </div>
              <div>
                <p className="font-medium">Validación</p>
                <p className="text-muted-foreground">Zod + React Hook Form</p>
              </div>
              <div>
                <p className="font-medium">Mobile</p>
                <p className="text-muted-foreground">Capacitor Ready</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
