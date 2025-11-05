/**
 * Register Page
 */

import { RegisterForm } from '@/presentation/components/auth/register-form'

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-secondary/30">
      <RegisterForm />
    </div>
  )
}
