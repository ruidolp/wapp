/**
 * Register Form Component
 *
 * Formulario de registro con validación y manejo de errores
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'

import { registerWithEmailSchema, registerWithPhoneSchema, type RegisterWithEmailInput, type RegisterWithPhoneInput } from '@/infrastructure/utils/validation'
import { appConfig } from '@/config/app.config'

type RegisterFormData = RegisterWithEmailInput | RegisterWithPhoneInput

export function RegisterForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [accountType, setAccountType] = useState<'email' | 'phone'>('email')

  // Use appropriate schema based on account type
  const schema = accountType === 'email' ? registerWithEmailSchema : registerWithPhoneSchema

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true)

    try {
      const response = await fetch(`${appConfig.api.baseUrl}/api/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        toast({
          variant: 'destructive',
          title: 'Error al registrarse',
          description: result.error || 'Ocurrió un error al crear la cuenta',
        })
        return
      }

      toast({
        title: 'Cuenta creada',
        description: result.requiresVerification
          ? 'Verifica tu cuenta para continuar'
          : 'Tu cuenta ha sido creada exitosamente',
      })

      if (result.requiresVerification) {
        router.push(`/auth/verify?userId=${result.user.id}`)
      } else {
        router.push('/auth/login')
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Ocurrió un error al registrarse. Intenta de nuevo.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Crear Cuenta</CardTitle>
        <CardDescription>
          Completa el formulario para registrarte
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Account Type Selector */}
          {appConfig.auth.registration.allowedAccountTypes.email &&
            appConfig.auth.registration.allowedAccountTypes.phone && (
            <div className="flex gap-2 mb-4">
              <Button
                type="button"
                variant={accountType === 'email' ? 'default' : 'outline'}
                onClick={() => setAccountType('email')}
                className="flex-1"
              >
                Email
              </Button>
              <Button
                type="button"
                variant={accountType === 'phone' ? 'default' : 'outline'}
                onClick={() => setAccountType('phone')}
                className="flex-1"
              >
                Teléfono
              </Button>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              type="text"
              placeholder="Tu nombre completo"
              disabled={isLoading}
              {...register('name')}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          {accountType === 'email' ? (
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                disabled={isLoading}
                {...register('email' as keyof RegisterFormData)}
              />
              {errors.email && 'email' in errors && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+52 1234567890"
                disabled={isLoading}
                {...register('phone' as keyof RegisterFormData)}
              />
              {errors.phone && 'phone' in errors && (
                <p className="text-sm text-destructive">{errors.phone.message}</p>
              )}
            </div>
          )}

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

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              disabled={isLoading}
              {...register('confirmPassword')}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex flex-col">
        <div className="text-sm text-center text-muted-foreground">
          ¿Ya tienes cuenta?{' '}
          <Button
            variant="link"
            className="p-0 h-auto font-normal"
            onClick={() => router.push('/auth/login')}
          >
            Inicia sesión
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
