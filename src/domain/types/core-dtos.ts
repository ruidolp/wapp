/**
 * DTOs (Data Transfer Objects) para APIs del CORE
 *
 * Estos tipos definen la estructura de datos que se envían/reciben
 * en las llamadas a la API.
 */

import {
  TipoBilletera,
  TipoSobre,
  TipoTransaccion,
  FrecuenciaIngreso,
  Billetera,
  Sobre,
  Categoria,
  Subcategoria,
  Transaccion,
  IngresoRecurrente,
} from './core'

/**
 * BILLETERAS - DTOs
 */

export interface CrearBilleteraInput {
  nombre: string
  tipo: TipoBilletera
  saldo_inicial: number
  is_compartida?: boolean
}

export interface ActualizarBilleteraInput {
  nombre?: string
  saldo_real?: number // Para ajustes/reconciliación
}

export interface TransferirBilleterasInput {
  billetera_origen_id: string
  billetera_destino_id: string
  monto: number
  descripcion?: string
}

export interface DepositarBilleteraInput {
  billetera_id: string
  monto: number
  concepto?: string
}

export interface PagarTCInput {
  billetera_tc_id: string
  monto_pagado: number
  monto_usado: number
  billetera_pago_id?: string // Desde qué billetera se paga (opcional)
}

export interface CompartirBilleteraInput {
  billetera_id: string
  email_usuario: string
}

export interface BilleteraResponse extends Billetera {
  disponible?: number // Calculado: saldo_proyectado si > 0
}

/**
 * SOBRES - DTOs
 */

export interface CrearSobreInput {
  nombre: string
  tipo: TipoSobre
  is_compartido?: boolean
  categorias_ids?: string[] // IDs de categorías existentes
  nuevas_categorias?: string[] // Nombres para crear inline
}

export interface ActualizarSobreInput {
  nombre?: string
}

export interface AsignarPresupuestoInput {
  sobre_id: string
  asignaciones: {
    billetera_id: string
    monto: number
  }[]
}

export interface AumentarPresupuestoInput {
  sobre_id: string
  monto: number
  billetera_id: string
}

export interface DisminuirPresupuestoInput {
  sobre_id: string
  monto: number
}

export interface TransferirPresupuestoInput {
  sobre_origen_id: string
  sobre_destino_id: string
  monto: number
}

export interface AgregarCategoriasInput {
  sobre_id: string
  categorias_ids?: string[]
  nuevas_categorias?: string[]
}

export interface InvitarASobreInput {
  sobre_id: string
  email_usuario: string
}

export interface SobreResponse extends Sobre {
  disponible?: number // Calculado: presupuesto - gastado
  categorias?: Categoria[]

  // Para compartidos
  participantes?: {
    usuario_id: string
    nombre: string
    presupuesto_asignado: number
    gastado: number
    disponible: number
  }[]

  // Mi tracking individual (en compartidos)
  mi_presupuesto?: number
  mi_gastado?: number
  mi_disponible?: number
}

/**
 * CATEGORÍAS - DTOs
 */

export interface CrearCategoriaInput {
  nombre: string
}

export interface ActualizarCategoriaInput {
  nombre: string
}

export interface CategoriaResponse extends Categoria {
  total_gastado?: number // En todos los sobres
  sobres_ids?: string[] // Sobres que usan esta categoría
}

/**
 * SUBCATEGORÍAS - DTOs
 */

export interface CrearSubcategoriaInput {
  nombre: string
  categoria_id: string
}

export interface ActualizarSubcategoriaInput {
  nombre?: string
  categoria_id?: string
}

export interface SubcategoriaResponse extends Subcategoria {
  total_gastado?: number
  categoria_nombre?: string
}

/**
 * TRANSACCIONES - DTOs
 */

export interface RegistrarGastoInput {
  monto: number
  billetera_id: string
  sobre_id?: string
  categoria_id?: string
  subcategoria_id?: string
  descripcion?: string
  fecha?: string // ISO date
}

export interface RegistrarIngresoInput {
  monto: number
  billetera_id: string
  concepto?: string
  fecha?: string
}

export interface ActualizarTransaccionInput {
  monto?: number
  sobre_id?: string
  categoria_id?: string
  subcategoria_id?: string
  descripcion?: string
}

export interface TransaccionResponse extends Transaccion {
  billetera_nombre?: string
  sobre_nombre?: string
  categoria_nombre?: string
  subcategoria_nombre?: string
  usuario_nombre?: string
}

/**
 * INGRESOS RECURRENTES - DTOs
 */

export interface CrearIngresoRecurrenteInput {
  nombre: string
  monto: number
  frecuencia: FrecuenciaIngreso
  dia: number
  billetera_id: string
  auto_distribuir?: boolean
  distribucion?: {
    sobre_id: string
    monto: number
  }[]
}

export interface ActualizarIngresoRecurrenteInput {
  nombre?: string
  monto?: number
  dia?: number
  auto_distribuir?: boolean
  distribucion?: {
    sobre_id: string
    monto: number
  }[]
}

export interface IngresoRecurrenteResponse extends IngresoRecurrente {
  billetera_nombre?: string
  distribucion_sobres?: {
    sobre_id: string
    sobre_nombre: string
    monto: number
  }[]
}

export interface EjecutarIngresoRecurrenteInput {
  ingreso_recurrente_id: string
  distribuir?: boolean // Si false, solo deposita sin distribuir
  sobres_seleccionados?: string[] // Para distribución parcial
}

/**
 * REPORTES - DTOs
 */

export interface ReporteBilleteraParams {
  billetera_id: string
  fecha_inicio?: string
  fecha_fin?: string
}

export interface ReporteSobreParams {
  sobre_id: string
  fecha_inicio?: string
  fecha_fin?: string
}

export interface ReporteCategoriaParams {
  categoria_id: string
  sobre_id?: string // Si se especifica, solo ese sobre; si no, global
  fecha_inicio?: string
  fecha_fin?: string
}

export interface ReporteSubcategoriaParams {
  subcategoria_id: string
  fecha_inicio?: string
  fecha_fin?: string
}

export interface ReporteBilleteraResponse {
  billetera: BilleteraResponse
  transacciones: TransaccionResponse[]
  total_ingresos: number
  total_gastos: number
  saldo_inicial: number
  saldo_final: number
}

export interface ReporteSobreResponse {
  sobre: SobreResponse
  presupuesto_asignado: number
  gastado: number
  disponible: number
  por_categoria: {
    categoria_id: string
    categoria_nombre: string
    presupuestado: number
    gastado: number
    disponible: number
  }[]
  gastos: TransaccionResponse[]
}

export interface ReporteCategoriaResponse {
  categoria: CategoriaResponse
  total_gastado: number
  por_sobre?: {
    sobre_id: string
    sobre_nombre: string
    gastado: number
  }[]
  por_subcategoria: {
    subcategoria_id: string
    subcategoria_nombre: string
    gastado: number
  }[]
  gastos: TransaccionResponse[]
}

export interface ReporteSubcategoriaResponse {
  subcategoria: SubcategoriaResponse
  total_gastado: number
  por_sobre: {
    sobre_id: string
    sobre_nombre: string
    gastado: number
  }[]
  por_billetera: {
    billetera_id: string
    billetera_nombre: string
    gastado: number
  }[]
  gastos: TransaccionResponse[]
}

/**
 * DASHBOARD - DTOs
 */

export interface DashboardResponse {
  billeteras: {
    total_real: number
    total_proyectado: number
    billeteras: BilleteraResponse[]
  }
  sobres: {
    total_presupuestado: number
    total_gastado: number
    total_disponible: number
    sobres: SobreResponse[]
  }
  mes_actual: {
    ingresos: number
    gastos: number
    balance: number
    auto_aumentos: number // Total de auto-aumentos del mes
  }
  ultimas_transacciones: TransaccionResponse[]
}

/**
 * Respuestas genéricas de API
 */

export interface ApiSuccessResponse<T = any> {
  success: true
  data: T
  message?: string
}

export interface ApiErrorResponse {
  success: false
  error: string
  details?: any
}
