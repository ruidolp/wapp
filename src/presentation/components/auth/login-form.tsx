/**
 * Login Form Component
 *
 * Formulario de inicio de sesión con validación y manejo de errores
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'

import { loginSchema, type LoginInput } from '@/infrastructure/utils/validation'
import { appConfig } from '@/config/app.config'

export function LoginForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  })

  // Fix hydration mismatch by only rendering OAuth after client-side mount
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        redirect: false,
        identifier: data.identifier,
        password: data.password,
      })

      if (result?.error) {
        toast({
          variant: 'destructive',
          title: 'Error al iniciar sesión',
          description: 'Credenciales inválidas. Por favor verifica tus datos.',
        })
      } else if (result?.ok) {
        toast({
          title: 'Bienvenido',
          description: 'Inicio de sesión exitoso',
        })
        router.push(appConfig.routes.afterLogin)
        router.refresh()
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Ocurrió un error al iniciar sesión. Intenta de nuevo.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuthSignIn = async (provider: 'google' | 'facebook') => {
    setIsLoading(true)
    try {
      await signIn(provider, {
        callbackUrl: appConfig.routes.afterLogin,
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: `Error al iniciar sesión con ${provider}`,
      })
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Iniciar Sesión</CardTitle>
        <CardDescription>
          Ingresa tus credenciales para acceder a tu cuenta
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="identifier">Email o Teléfono</Label>
            <Input
              id="identifier"
              type="text"
              placeholder="tu@email.com o +52 1234567890"
              disabled={isLoading}
              {...register('identifier')}
            />
            {errors.identifier && (
              <p className="text-sm text-destructive">{errors.identifier.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              disabled={isLoading}
              {...register('password')}
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </Button>
        </form>

        {/* OAuth Providers - Only render after client mount to prevent hydration mismatch */}
        {isMounted && (appConfig.auth.oauth.google.enabled || appConfig.auth.oauth.facebook.enabled) && (
          <>
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  O continúa con
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {appConfig.auth.oauth.google.enabled && (
                <Button
                  variant="outline"
                  onClick={() => handleOAuthSignIn('google')}
                  disabled={isLoading}
                >
                  Google
                </Button>
              )}

              {appConfig.auth.oauth.facebook.enabled && (
                <Button
                  variant="outline"
                  onClick={() => handleOAuthSignIn('facebook')}
                  disabled={isLoading}
                >
                  Facebook
                </Button>
              )}
            </div>
          </>
        )}
      </CardContent>

      <CardFooter className="flex flex-col space-y-2">
        {appConfig.auth.recovery.enabled && (
          <Button
            variant="link"
            className="text-sm"
            onClick={() => router.push('/auth/recovery')}
          >
            ¿Olvidaste tu contraseña?
          </Button>
        )}

        {appConfig.auth.registration.allowSelfSignup && (
          <div className="text-sm text-center text-muted-foreground">
            ¿No tienes cuenta?{' '}
            <Button
              variant="link"
              className="p-0 h-auto font-normal"
              onClick={() => router.push('/auth/register')}
            >
              Regístrate
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  )
}
