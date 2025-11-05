/**
 * Dashboard Page
 */

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { getSession, signOut } from '@/infrastructure/lib/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LanguageSwitcher } from '@/components/ui/language-switcher'

export default async function DashboardPage({ params: { locale } }: { params: { locale: string } }) {
  const session = await getSession()
  const t = await getTranslations('dashboard')

  if (!session?.user) {
    redirect(`/${locale}/auth/login`)
  }

  async function handleSignOut() {
    'use server'
    await signOut({ redirectTo: `/${locale}/auth/login` })
  }

  return (
    <div className="min-h-screen bg-secondary/30 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold">{t('title')}</h1>
            <p className="text-muted-foreground mt-2">
              {t('welcome', { name: session.user.name })}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <form action={handleSignOut}>
              <Button variant="outline">{t('signOut')}</Button>
            </form>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('userInfo.title')}</CardTitle>
              <CardDescription>{t('userInfo.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-sm font-medium">{t('userInfo.name')}</p>
                <p className="text-sm text-muted-foreground">{session.user.name}</p>
              </div>
              {session.user.email && (
                <div>
                  <p className="text-sm font-medium">{t('userInfo.email')}</p>
                  <p className="text-sm text-muted-foreground">{session.user.email}</p>
                </div>
              )}
              {session.user.phone && (
                <div>
                  <p className="text-sm font-medium">{t('userInfo.phone')}</p>
                  <p className="text-sm text-muted-foreground">{session.user.phone}</p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium">{t('userInfo.accountType')}</p>
                <p className="text-sm text-muted-foreground">{session.user.accountType}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('stats.title')}</CardTitle>
              <CardDescription>{t('stats.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {t('stats.comingSoon')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('actions.title')}</CardTitle>
              <CardDescription>{t('actions.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href={`/${locale}/showcase`} className="block">
                <Button variant="outline" className="w-full">
                  {t('actions.showcase')}
                </Button>
              </Link>
              <Button variant="outline" className="w-full">
                {t('actions.help')}
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t('config.title')}</CardTitle>
            <CardDescription>{t('config.description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-medium">{t('config.framework')}</p>
                <p className="text-muted-foreground">Next.js 15 (App Router)</p>
              </div>
              <div>
                <p className="font-medium">{t('config.database')}</p>
                <p className="text-muted-foreground">PostgreSQL + Prisma</p>
              </div>
              <div>
                <p className="font-medium">{t('config.auth')}</p>
                <p className="text-muted-foreground">NextAuth v5</p>
              </div>
              <div>
                <p className="font-medium">{t('config.ui')}</p>
                <p className="text-muted-foreground">Tailwind + shadcn/ui</p>
              </div>
              <div>
                <p className="font-medium">{t('config.validation')}</p>
                <p className="text-muted-foreground">Zod + React Hook Form</p>
              </div>
              <div>
                <p className="font-medium">{t('config.mobile')}</p>
                <p className="text-muted-foreground">Capacitor Ready</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
