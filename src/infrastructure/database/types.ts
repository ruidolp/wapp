/**
 * Kysely Database Types
 *
 * Tipos generados del schema de PostgreSQL.
 * Para regenerar: npx kysely-codegen --dialect postgres --out-file src/infrastructure/database/types.ts
 */

import type { ColumnType } from 'kysely'

/**
 * Enums de la base de datos
 */
export type AccountType = 'EMAIL' | 'PHONE'
export type VerificationCodeType = 'EMAIL_CONFIRMATION' | 'PHONE_CONFIRMATION' | 'PASSWORD_RESET'
export type VerificationCodeStatus = 'PENDING' | 'USED' | 'EXPIRED'

/**
 * Helper type para columnas generadas (timestamps, etc)
 */
export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>

/**
 * Helper type para columnas timestamp
 */
export type Timestamp = ColumnType<Date, Date | string, Date | string>

/**
 * Tabla: users
 */
export interface UsersTable {
  id: Generated<string>
  name: string
  email: string | null
  email_verified: Timestamp | null
  phone: string | null
  phone_verified: Timestamp | null
  image: string | null
  password: string | null
  account_type: Generated<AccountType>
  created_at: Generated<Timestamp>
  updated_at: Timestamp
  last_login_at: Timestamp | null
}

/**
 * Tabla: accounts (OAuth providers)
 */
export interface AccountsTable {
  id: Generated<string>
  user_id: string
  type: string
  provider: string
  provider_account_id: string
  refresh_token: string | null
  access_token: string | null
  expires_at: number | null
  token_type: string | null
  scope: string | null
  id_token: string | null
  session_state: string | null
  created_at: Generated<Timestamp>
  updated_at: Timestamp
}

/**
 * Tabla: sessions (NextAuth sessions)
 */
export interface SessionsTable {
  id: Generated<string>
  session_token: string
  user_id: string
  expires: Timestamp
  created_at: Generated<Timestamp>
  updated_at: Timestamp
}

/**
 * Tabla: verification_tokens (NextAuth verification)
 */
export interface VerificationTokensTable {
  identifier: string
  token: string
  expires: Timestamp
}

/**
 * Tabla: verification_codes (custom verification codes)
 */
export interface VerificationCodesTable {
  id: Generated<string>
  user_id: string
  code: string
  type: VerificationCodeType
  status: Generated<VerificationCodeStatus>
  expires_at: Timestamp
  used_at: Timestamp | null
  created_at: Generated<Timestamp>
  updated_at: Timestamp
}

/**
 * Database interface con todas las tablas
 */
export interface Database {
  users: UsersTable
  accounts: AccountsTable
  sessions: SessionsTable
  verification_tokens: VerificationTokensTable
  verification_codes: VerificationCodesTable
}
