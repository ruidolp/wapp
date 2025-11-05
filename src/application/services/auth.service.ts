/**
 * Servicio de autenticación
 *
 * Contiene la lógica de negocio para autenticación, registro,
 * verificación y recuperación de cuenta.
 */

import { prisma } from '@/infrastructure/database/prisma'
import { hashPassword, verifyPassword, generateVerificationCode, generateCodeExpiration, sanitizeEmail, sanitizePhone } from '@/infrastructure/utils/crypto'
import { detectIdentifierType } from '@/infrastructure/utils/validation'
import { appConfig } from '@/config/app.config'
import type {
  RegisterCredentials,
  LoginCredentials,
  AuthResult,
  DomainUser,
  RecoveryRequest,
  ResetPasswordRequest,
  VerifyAccountRequest,
} from '@/domain/types/auth.types'

/**
 * Registrar un nuevo usuario
 */
export async function registerUser(
  credentials: RegisterCredentials
): Promise<AuthResult> {
  try {
    // Validar que el tipo de cuenta esté permitido
    if (credentials.accountType === 'EMAIL' && !appConfig.auth.registration.allowedAccountTypes.email) {
      return {
        success: false,
        error: 'Registro con email no está permitido',
      }
    }

    if (credentials.accountType === 'PHONE' && !appConfig.auth.registration.allowedAccountTypes.phone) {
      return {
        success: false,
        error: 'Registro con teléfono no está permitido',
      }
    }

    // Sanitizar email o teléfono
    const email = credentials.email ? sanitizeEmail(credentials.email) : undefined
    const phone = credentials.phone ? sanitizePhone(credentials.phone) : undefined

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          email ? { email } : {},
          phone ? { phone } : {},
        ],
      },
    })

    if (existingUser) {
      return {
        success: false,
        error: 'El usuario ya existe',
      }
    }

    // Hash de la contraseña
    const hashedPassword = await hashPassword(credentials.password)

    // Crear usuario
    const user = await prisma.user.create({
      data: {
        name: credentials.name,
        email,
        phone,
        password: hashedPassword,
        accountType: credentials.accountType,
      },
    })

    // Generar código de verificación si está habilitado
    if (appConfig.auth.confirmation.enabled) {
      const code = generateVerificationCode(appConfig.auth.confirmation.codeLength)
      const expiresAt = generateCodeExpiration(appConfig.auth.confirmation.codeExpirationHours * 60)

      await prisma.verificationCode.create({
        data: {
          userId: user.id,
          code,
          type: credentials.accountType === 'EMAIL' ? 'EMAIL_CONFIRMATION' : 'PHONE_CONFIRMATION',
          expiresAt,
        },
      })

      // TODO: Enviar código por email o SMS
      // await sendVerificationCode(user, code)
    }

    const domainUser = mapToDomainUser(user)

    return {
      success: true,
      user: domainUser,
      requiresVerification: appConfig.auth.confirmation.enabled,
    }
  } catch (error) {
    console.error('Error en registerUser:', error)
    return {
      success: false,
      error: 'Error al registrar usuario',
    }
  }
}

/**
 * Login de usuario
 */
export async function loginUser(
  credentials: LoginCredentials
): Promise<AuthResult> {
  try {
    // Detectar si es email o teléfono
    const identifierType = detectIdentifierType(credentials.identifier)

    if (identifierType === 'unknown') {
      return {
        success: false,
        error: 'Email o teléfono inválido',
      }
    }

    // Sanitizar identificador
    const identifier = identifierType === 'email'
      ? sanitizeEmail(credentials.identifier)
      : sanitizePhone(credentials.identifier)

    // Buscar usuario
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          identifierType === 'email' ? { email: identifier } : {},
          identifierType === 'phone' ? { phone: identifier } : {},
        ],
      },
    })

    if (!user || !user.password) {
      return {
        success: false,
        error: 'Credenciales inválidas',
      }
    }

    // Verificar contraseña
    const isValidPassword = await verifyPassword(credentials.password, user.password)

    if (!isValidPassword) {
      return {
        success: false,
        error: 'Credenciales inválidas',
      }
    }

    // Verificar si requiere confirmación
    if (appConfig.auth.confirmation.enabled && !appConfig.auth.confirmation.allowUnverifiedLogin) {
      const isVerified = identifierType === 'email'
        ? user.emailVerified
        : user.phoneVerified

      if (!isVerified) {
        return {
          success: false,
          error: 'Cuenta no verificada. Por favor verifica tu cuenta.',
          requiresVerification: true,
        }
      }
    }

    // Actualizar última fecha de login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    })

    const domainUser = mapToDomainUser(user)

    return {
      success: true,
      user: domainUser,
    }
  } catch (error) {
    console.error('Error en loginUser:', error)
    return {
      success: false,
      error: 'Error al iniciar sesión',
    }
  }
}

/**
 * Solicitar recuperación de contraseña
 */
export async function requestPasswordRecovery(
  request: RecoveryRequest
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!appConfig.auth.recovery.enabled) {
      return {
        success: false,
        error: 'Recuperación de contraseña no está habilitada',
      }
    }

    // Detectar tipo de identificador
    const identifierType = detectIdentifierType(request.identifier)

    if (identifierType === 'unknown') {
      return {
        success: false,
        error: 'Email o teléfono inválido',
      }
    }

    // Sanitizar
    const identifier = identifierType === 'email'
      ? sanitizeEmail(request.identifier)
      : sanitizePhone(request.identifier)

    // Buscar usuario
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          identifierType === 'email' ? { email: identifier } : {},
          identifierType === 'phone' ? { phone: identifier } : {},
        ],
      },
    })

    // Por seguridad, siempre retornar éxito aunque el usuario no exista
    if (!user) {
      return { success: true }
    }

    // Invalidar códigos anteriores
    await prisma.verificationCode.updateMany({
      where: {
        userId: user.id,
        type: 'PASSWORD_RESET',
        status: 'PENDING',
      },
      data: {
        status: 'EXPIRED',
      },
    })

    // Generar nuevo código
    const code = generateVerificationCode(appConfig.auth.recovery.codeLength)
    const expiresAt = generateCodeExpiration(appConfig.auth.recovery.codeExpirationMinutes)

    await prisma.verificationCode.create({
      data: {
        userId: user.id,
        code,
        type: 'PASSWORD_RESET',
        expiresAt,
      },
    })

    // TODO: Enviar código por email o SMS
    // await sendRecoveryCode(user, code)

    return { success: true }
  } catch (error) {
    console.error('Error en requestPasswordRecovery:', error)
    return {
      success: false,
      error: 'Error al solicitar recuperación',
    }
  }
}

/**
 * Reset de contraseña con código
 */
export async function resetPassword(
  request: ResetPasswordRequest
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!appConfig.auth.recovery.enabled) {
      return {
        success: false,
        error: 'Recuperación de contraseña no está habilitada',
      }
    }

    // Buscar código de verificación
    const verificationCode = await prisma.verificationCode.findFirst({
      where: {
        userId: request.userId,
        code: request.code,
        type: 'PASSWORD_RESET',
        status: 'PENDING',
      },
    })

    if (!verificationCode) {
      return {
        success: false,
        error: 'Código inválido o expirado',
      }
    }

    // Verificar si el código ha expirado
    if (new Date() > verificationCode.expiresAt) {
      await prisma.verificationCode.update({
        where: { id: verificationCode.id },
        data: { status: 'EXPIRED' },
      })

      return {
        success: false,
        error: 'Código expirado',
      }
    }

    // Hash de la nueva contraseña
    const hashedPassword = await hashPassword(request.newPassword)

    // Actualizar contraseña
    await prisma.user.update({
      where: { id: request.userId },
      data: { password: hashedPassword },
    })

    // Marcar código como usado
    await prisma.verificationCode.update({
      where: { id: verificationCode.id },
      data: {
        status: 'USED',
        usedAt: new Date(),
      },
    })

    return { success: true }
  } catch (error) {
    console.error('Error en resetPassword:', error)
    return {
      success: false,
      error: 'Error al resetear contraseña',
    }
  }
}

/**
 * Verificar cuenta con código
 */
export async function verifyAccount(
  request: VerifyAccountRequest
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!appConfig.auth.confirmation.enabled) {
      return {
        success: false,
        error: 'Verificación de cuenta no está habilitada',
      }
    }

    // Buscar código
    const verificationCode = await prisma.verificationCode.findFirst({
      where: {
        userId: request.userId,
        code: request.code,
        type: request.type,
        status: 'PENDING',
      },
    })

    if (!verificationCode) {
      return {
        success: false,
        error: 'Código inválido',
      }
    }

    // Verificar si ha expirado
    if (new Date() > verificationCode.expiresAt) {
      await prisma.verificationCode.update({
        where: { id: verificationCode.id },
        data: { status: 'EXPIRED' },
      })

      return {
        success: false,
        error: 'Código expirado',
      }
    }

    // Actualizar usuario
    const updateData: any = {}
    if (request.type === 'EMAIL_CONFIRMATION') {
      updateData.emailVerified = new Date()
    } else if (request.type === 'PHONE_CONFIRMATION') {
      updateData.phoneVerified = new Date()
    }

    await prisma.user.update({
      where: { id: request.userId },
      data: updateData,
    })

    // Marcar código como usado
    await prisma.verificationCode.update({
      where: { id: verificationCode.id },
      data: {
        status: 'USED',
        usedAt: new Date(),
      },
    })

    return { success: true }
  } catch (error) {
    console.error('Error en verifyAccount:', error)
    return {
      success: false,
      error: 'Error al verificar cuenta',
    }
  }
}

/**
 * Obtener usuario por ID
 */
export async function getUserById(
  userId: string
): Promise<DomainUser | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return null
    }

    return mapToDomainUser(user)
  } catch (error) {
    console.error('Error en getUserById:', error)
    return null
  }
}

/**
 * Mapear usuario de Prisma a dominio
 */
function mapToDomainUser(user: any): DomainUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    emailVerified: user.emailVerified,
    phone: user.phone,
    phoneVerified: user.phoneVerified,
    image: user.image,
    accountType: user.accountType,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    lastLoginAt: user.lastLoginAt,
  }
}
