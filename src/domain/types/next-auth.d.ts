/**
 * Extensión de tipos de NextAuth
 *
 * Extiende los tipos por defecto de NextAuth para incluir campos personalizados
 */

import { DefaultSession, DefaultUser } from 'next-auth'
import { JWT, DefaultJWT } from 'next-auth/jwt'

declare module 'next-auth' {
  /**
   * Extensión de Session
   */
  interface Session extends DefaultSession {
    user: {
      id: string
      accountType: string
      phone?: string | null
    } & DefaultSession['user']
  }

  /**
   * Extensión de User
   */
  interface User extends DefaultUser {
    accountType?: string
    phone?: string | null
  }
}

declare module 'next-auth/jwt' {
  /**
   * Extensión de JWT
   */
  interface JWT extends DefaultJWT {
    id: string
    accountType: string
    phone?: string
    provider?: string
    accessToken?: string
  }
}
