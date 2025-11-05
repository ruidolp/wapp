/**
 * Login Page
 */

import { LoginForm } from '@/presentation/components/auth/login-form'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-secondary/30">
      <LoginForm />
    </div>
  )
}
