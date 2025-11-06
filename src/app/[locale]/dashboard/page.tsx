/**
 * Dashboard Page con Gestión de Suscripciones
 */

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { getSession, signOut } from '@/infrastructure/lib/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LanguageSwitcher } from '@/components/ui/language-switcher'
import { Badge } from '@/components/ui/badge'

export default async function DashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const session = await getSession()
  const t = await getTranslations('dashboard')

  if (!session?.user) {
    redirect(`/${locale}/auth/login`)
  }

  const subscription = session.user.subscription

  async function handleSignOut() {
    'use server'
    await signOut({ redirectTo: `/${locale}/auth/login` })
  }

  // Helper para obtener el badge de estado correcto
  const getStatusBadge = (status: string) => {
    const badges = {
      free: <Badge variant="secondary">{t('subscription.status.free')}</Badge>,
      trial: <Badge variant="default" className="bg-blue-500">{t('subscription.status.trial')}</Badge>,
      active: <Badge variant="default" className="bg-green-500">{t('subscription.status.active')}</Badge>,
      expired: <Badge variant="destructive">{t('subscription.status.expired')}</Badge>,
      cancelled: <Badge variant="outline">{t('subscription.status.cancelled')}</Badge>,
      payment_failed: <Badge variant="destructive">{t('subscription.status.payment_failed')}</Badge>,
    }
    return badges[status as keyof typeof badges] || <Badge>{status}</Badge>
  }

  // Helper para determinar si puede hacer upgrade
  const canUpgrade = subscription.planSlug === 'free' || subscription.planSlug === 'premium'
  const canDowngrade = subscription.planSlug === 'premium' || subscription.planSlug === 'familiar'

  return (
    <div className="min-h-screen bg-secondary/30 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold">{t('title')}</h1>
            <p className="text-muted-foreground mt-2">
              {t('welcome', { name: session.user.name || 'User' })}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <form action={handleSignOut}>
              <Button variant="outline">{t('signOut')}</Button>
            </form>
          </div>
        </div>

        {/* Grid Principal */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {/* Card de Información de Usuario */}
          <Card>
            <CardHeader>
              <CardTitle>{t('userInfo.title')}</CardTitle>
              <CardDescription>{t('userInfo.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-sm font-medium">{t('userInfo.name')}</p>
                <p className="text-sm text-muted-foreground">{session.user.name || 'N/A'}</p>
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

          {/* Card de Suscripción Actual */}
          <Card className="md:col-span-2">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{t('subscription.title')}</CardTitle>
                  <CardDescription>{t('subscription.description')}</CardDescription>
                </div>
                {getStatusBadge(subscription.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">{t('subscription.currentPlan')}</p>
                  <p className="text-2xl font-bold text-primary">{subscription.planName}</p>
                </div>

                {subscription.isLinked && subscription.ownerId && (
                  <div>
                    <p className="text-sm font-medium">{t('subscription.linkedAccount')}</p>
                    <p className="text-sm text-muted-foreground">{t('subscription.linkedToOwner')}</p>
                  </div>
                )}

                {subscription.trialEndsAt && (
                  <div>
                    <p className="text-sm font-medium">{t('subscription.trialEnds')}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(subscription.trialEndsAt).toLocaleDateString()}
                    </p>
                  </div>
                )}

                {subscription.expiresAt && (
                  <div>
                    <p className="text-sm font-medium">{t('subscription.expiresAt')}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(subscription.expiresAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>

              {/* Acciones de Suscripción */}
              <div className="flex gap-2 pt-4 border-t">
                {canUpgrade && (
                  <Link href={`/${locale}/dashboard/upgrade`} className="w-full">
                    <Button variant="default" className="w-full">
                      {subscription.planSlug === 'free'
                        ? t('subscription.upgradeToPremium')
                        : t('subscription.upgradeToFamiliar')}
                    </Button>
                  </Link>
                )}

                {canDowngrade && subscription.status === 'active' && (
                  <Link href={`/${locale}/dashboard/downgrade`} className="w-full">
                    <Button variant="outline" className="w-full">
                      {t('subscription.downgrade')}
                    </Button>
                  </Link>
                )}

                {subscription.status === 'cancelled' && (
                  <Button variant="default" className="w-full">
                    {t('subscription.reactivate')}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Card de Capacidades y Límites */}
        {subscription.capabilities.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>{t('subscription.capabilities.title')}</CardTitle>
              <CardDescription>{t('subscription.capabilities.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {subscription.capabilities.map((capability) => (
                  <div key={capability} className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <span className="text-sm">{t(`subscription.capabilities.${capability}`)}</span>
                  </div>
                ))}
              </div>

              {Object.keys(subscription.limits).length > 0 && (
                <div className="mt-6 pt-6 border-t">
                  <p className="text-sm font-medium mb-3">{t('subscription.limits.title')}</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {Object.entries(subscription.limits).map(([key, value]) => (
                      <div key={key}>
                        <p className="text-xs text-muted-foreground">{t(`subscription.limits.${key}`)}</p>
                        <p className="text-lg font-semibold">{value === null ? '∞' : value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Card de Usuarios Vinculados (solo si no está vinculado y tiene plan premium/familiar) */}
        {!subscription.isLinked && (subscription.planSlug === 'premium' || subscription.planSlug === 'familiar') && (
          <Card>
            <CardHeader>
              <CardTitle>{t('linkedUsers.title')}</CardTitle>
              <CardDescription>{t('linkedUsers.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border p-4 bg-muted/50">
                <p className="text-sm text-muted-foreground text-center">
                  {t('linkedUsers.empty')}
                </p>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="w-full">
                  {t('linkedUsers.generateCode')}
                </Button>
                <Button variant="outline" className="w-full">
                  {t('linkedUsers.viewCodes')}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Card de Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              <Button variant="outline" className="w-full">
                {t('actions.help')}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Card de Configuración Técnica */}
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
                <p className="text-muted-foreground">PostgreSQL + Kysely</p>
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
