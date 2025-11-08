/**
 * Tipos del dominio CORE - Sistema de gestión financiera
 *
 * Jerarquía:
 * BILLETERAS (dinero real) → SOBRES (presupuesto virtual) → CATEGORÍAS (conceptos) → SUBCATEGORÍAS (marcas)
 */

/**
 * BILLETERAS - Dinero real
 */

export enum TipoBilletera {
  // Sin interés
  DEBITO = 'DEBITO',
  EFECTIVO = 'EFECTIVO',
  AHORRO = 'AHORRO',
  CUENTA_VISTA = 'CUENTA_VISTA',

  // Con interés (créditos)
  TARJETA_CREDITO = 'TARJETA_CREDITO',
  LINEA_CREDITO = 'LINEA_CREDITO',
  SOBREGIRO = 'SOBREGIRO',
  PRESTAMO = 'PRESTAMO',
}

export interface Billetera {
  id: string
  nombre: string
  tipo: TipoBilletera
  saldo_real: number
  saldo_proyectado: number
  is_compartida: boolean
  usuario_id: string // Owner
  created_at: Date
  updated_at: Date
  deleted_at?: Date // Soft delete
}

/**
 * SOBRES - Presupuesto virtual
 */

export enum TipoSobre {
  GASTO = 'GASTO', // Presupuesto que se resta
  AHORRO = 'AHORRO', // Meta que se suma (futuro)
  DEUDA = 'DEUDA', // Tracking de deudas (futuro)
}

export interface Sobre {
  id: string
  nombre: string
  tipo: TipoSobre
  is_compartido: boolean
  usuario_id: string // Owner/Creator

  // Para tipo GASTO
  presupuesto_asignado?: number
  gastado?: number

  // Para tipo AHORRO (futuro)
  meta_objetivo?: number
  ahorrado_actual?: number

  created_at: Date
  updated_at: Date
  deleted_at?: Date
}

/**
 * Relación Sobre-Usuario para compartidos
 */
export interface SobreUsuario {
  sobre_id: string
  usuario_id: string
  presupuesto_asignado: number
  gastado: number
  role: 'OWNER' | 'PARTICIPANTE'
  created_at: Date
}

/**
 * CATEGORÍAS - Conceptos de gasto (catálogo global del usuario)
 */

export interface Categoria {
  id: string
  nombre: string
  usuario_id: string // Catálogo personal
  created_at: Date
  updated_at: Date
  deleted_at?: Date
}

/**
 * Relación Sobre-Categoría
 */
export interface SobreCategoria {
  sobre_id: string
  categoria_id: string
  created_at: Date
}

/**
 * SUBCATEGORÍAS - Marcas/empresas (catálogo global del usuario)
 */

export interface Subcategoria {
  id: string
  nombre: string
  categoria_id: string // Asociada a una categoría
  usuario_id: string // Catálogo personal
  created_at: Date
  updated_at: Date
  deleted_at?: Date
}

/**
 * TRANSACCIONES - Movimientos de dinero (serializables)
 */

export enum TipoTransaccion {
  GASTO = 'GASTO',
  INGRESO = 'INGRESO',
  TRANSFERENCIA = 'TRANSFERENCIA',
  DEPOSITO = 'DEPOSITO',
  PAGO_TC = 'PAGO_TC', // Pago de tarjeta de crédito
  AJUSTE = 'AJUSTE', // Ajuste manual de saldo
}

export interface Transaccion {
  // OBLIGATORIOS
  id: string // UUID serializable
  monto: number
  billetera_id: string
  tipo: TipoTransaccion
  usuario_id: string // Quién la creó

  // OPCIONALES (flexibles)
  sobre_id?: string
  categoria_id?: string
  subcategoria_id?: string
  descripcion?: string
  fecha?: Date

  // Para transferencias
  billetera_destino_id?: string

  // Para pagos de TC
  pago_tc?: {
    monto_pagado: number
    monto_usado: number
    interes: number
  }

  // Auto-aumentos de sobre
  auto_aumento_sobre?: {
    sobre_id: string
    monto_aumentado: number
    razon: 'EXCESO_PRESUPUESTO'
  }

  // Metadata
  created_at: Date
  updated_at: Date
  deleted_at?: Date
  version: number // Para tracking de cambios
}

/**
 * INGRESOS RECURRENTES
 */

export enum FrecuenciaIngreso {
  MENSUAL = 'MENSUAL',
  QUINCENAL = 'QUINCENAL',
  SEMANAL = 'SEMANAL',
  ANUAL = 'ANUAL',
}

export enum EstadoIngresoRecurrente {
  ACTIVO = 'ACTIVO',
  PAUSADO = 'PAUSADO',
  ELIMINADO = 'ELIMINADO',
}

export interface IngresoRecurrente {
  id: string
  nombre: string
  monto: number
  frecuencia: FrecuenciaIngreso
  dia: number // Día del mes, semana, etc.
  billetera_id: string
  usuario_id: string

  // Auto-distribución a sobres
  auto_distribuir: boolean
  distribucion?: {
    sobre_id: string
    monto: number
  }[]

  // Estado
  estado: EstadoIngresoRecurrente
  proxima_ejecucion?: Date

  created_at: Date
  updated_at: Date
  deleted_at?: Date
}

/**
 * ASIGNACIONES DE PRESUPUESTO - Tracking de qué billetera aportó a qué sobre
 */

export interface AsignacionPresupuesto {
  id: string
  sobre_id: string
  billetera_id: string
  usuario_id: string
  monto: number
  tipo: 'INICIAL' | 'AUMENTO' | 'DISMINUCION' | 'TRANSFERENCIA'
  created_at: Date
}

/**
 * INVITACIONES A SOBRES COMPARTIDOS
 */

export enum EstadoInvitacion {
  PENDIENTE = 'PENDIENTE',
  ACEPTADA = 'ACEPTADA',
  RECHAZADA = 'RECHAZADA',
  CANCELADA = 'CANCELADA',
}

export interface InvitacionSobre {
  id: string
  sobre_id: string
  invitado_por_id: string
  invitado_email: string
  invitado_user_id?: string // Se llena al aceptar
  estado: EstadoInvitacion
  created_at: Date
  updated_at: Date
}
