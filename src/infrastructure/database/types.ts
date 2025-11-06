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
 * Enums de suscripciones
 */
export type SubscriptionStatus = 'trial' | 'active' | 'expired' | 'cancelled' | 'payment_failed' | 'free'
export type SubscriptionPlatform = 'web' | 'ios' | 'android'
export type SubscriptionPeriod = 'monthly' | 'yearly'
export type InvitationStatus = 'pending' | 'accepted' | 'expired' | 'revoked'
export type SubscriptionEventType =
  | 'trial_started'
  | 'trial_expired'
  | 'upgraded'
  | 'downgraded'
  | 'cancelled'
  | 'payment_succeeded'
  | 'payment_failed'
  | 'linked'
  | 'unlinked'

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
 * Tabla: subscription_plans (Planes de suscripción disponibles)
 */
export interface SubscriptionPlansTable {
  id: Generated<string>
  slug: string // 'free', 'premium', 'familiar'
  name: string
  description: string | null
  trial_days: number
  max_linked_users: number
  active: Generated<boolean>
  created_at: Generated<Timestamp>
  updated_at: Timestamp
}

/**
 * Tabla: plan_capabilities (Capacidades habilitadas por plan)
 */
export interface PlanCapabilitiesTable {
  id: Generated<string>
  plan_id: string
  capability_key: string // 'export_data', 'advanced_reports', etc.
  enabled: Generated<boolean>
  created_at: Generated<Timestamp>
}

/**
 * Tabla: plan_limits (Límites de recursos por plan)
 */
export interface PlanLimitsTable {
  id: Generated<string>
  plan_id: string
  resource_key: string // 'projects', 'storage_mb', etc.
  max_quantity: number | null // null = ilimitado
  created_at: Generated<Timestamp>
}

/**
 * Tabla: user_subscriptions (Suscripción activa de cada usuario)
 */
export interface UserSubscriptionsTable {
  id: Generated<string>
  user_id: string
  plan_id: string
  status: SubscriptionStatus
  platform: SubscriptionPlatform | null
  platform_subscription_id: string | null // ID en Stripe/Apple/Google
  period: SubscriptionPeriod | null // 'monthly' o 'yearly'
  started_at: Timestamp
  expires_at: Timestamp | null
  trial_ends_at: Timestamp | null
  cancelled_at: Timestamp | null
  created_at: Generated<Timestamp>
  updated_at: Timestamp
}

/**
 * Tabla: linked_users (Usuarios vinculados a una suscripción)
 */
export interface LinkedUsersTable {
  id: Generated<string>
  owner_user_id: string // Quien paga el plan
  linked_user_id: string // Quien recibe acceso
  linked_at: Generated<Timestamp>
  created_at: Generated<Timestamp>
}

/**
 * Tabla: invitation_codes (Códigos de invitación para vincular usuarios)
 */
export interface InvitationCodesTable {
  id: Generated<string>
  code: string // Código único (ej: ABC123XYZ)
  owner_user_id: string // Quien genera la invitación
  plan_id: string // Plan que se compartirá
  status: Generated<InvitationStatus>
  max_uses: number // Cuántas veces se puede usar
  uses_count: Generated<number>
  expires_at: Timestamp
  created_at: Generated<Timestamp>
  updated_at: Timestamp
}

/**
 * Tabla: subscription_history (Auditoría de cambios en suscripciones)
 */
export interface SubscriptionHistoryTable {
  id: Generated<string>
  user_id: string
  event_type: SubscriptionEventType
  from_plan_id: string | null
  to_plan_id: string | null
  platform: SubscriptionPlatform | null
  metadata: string | null // JSON con datos adicionales
  created_at: Generated<Timestamp>
}

/**
 * Tabla: payment_products (Productos de pago por plan/plataforma/moneda)
 */
export interface PaymentProductsTable {
  id: Generated<string>
  plan_id: string
  platform: SubscriptionPlatform
  period: SubscriptionPeriod
  currency: string // 'USD', 'EUR', etc.
  price: number // Decimal como número
  platform_product_id: string // 'premium_monthly_usd' en Stripe, etc.
  active: Generated<boolean>
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
  subscription_plans: SubscriptionPlansTable
  plan_capabilities: PlanCapabilitiesTable
  plan_limits: PlanLimitsTable
  user_subscriptions: UserSubscriptionsTable
  linked_users: LinkedUsersTable
  invitation_codes: InvitationCodesTable
  subscription_history: SubscriptionHistoryTable
  payment_products: PaymentProductsTable
}
