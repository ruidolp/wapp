/**
 * API Route para obtener configuración pública
 *
 * Este endpoint devuelve solo la configuración necesaria para el cliente
 * sin exponer secrets o información sensible.
 */

import { NextResponse } from 'next/server'
import { appConfig } from '@/config/app.config'

export async function GET() {
  return NextResponse.json({
    auth: {
      registration: {
        allowSelfSignup: appConfig.auth.registration.allowSelfSignup,
        allowedAccountTypes: appConfig.auth.registration.allowedAccountTypes,
      },
      recovery: {
        enabled: appConfig.auth.recovery.enabled,
      },
      oauth: {
        google: {
          enabled: appConfig.auth.oauth.google.enabled,
        },
        facebook: {
          enabled: appConfig.auth.oauth.facebook.enabled,
        },
      },
    },
  })
}
