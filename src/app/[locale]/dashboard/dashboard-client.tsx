'use client'

import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'
import { signOut } from 'next-auth/react'

interface User {
  id: string
  name?: string | null
  email?: string | null
}

interface DashboardClientProps {
  locale: string
  user: User
}

export function DashboardClient({ locale, user }: DashboardClientProps) {
  const handleLogout = async () => {
    await signOut({ callbackUrl: `/${locale}/auth/login` })
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">
              Bienvenido, {user.name || user.email}
            </p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar sesión
          </Button>
        </div>

        {/* Placeholder content */}
        <div className="rounded-lg border bg-card p-8 text-center">
          <p className="text-card-foreground">
            Dashboard en construcción
          </p>
        </div>
      </div>
    </div>
  )
}
