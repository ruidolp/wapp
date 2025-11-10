'use client'

import { TrendingUp, TrendingDown } from 'lucide-react'
import { CirculoCategoriasGastos, CategoriaGasto } from './CirculoCategoriasGastos'
import type { Sobre, Transaccion } from '@/domain/types'

interface SobreCardProps {
  sobre: Sobre
  categorias: CategoriaGasto[]
  transacciones: Transaccion[]
  totalGastado: number
}

// 8 Categorías dummy con colores del theme
const DUMMY_CATEGORIAS: CategoriaGasto[] = [
  { id: '1', nombre: 'Comida', emoji: '🍔', color: 'hsl(var(--primary))', gastado: 45000, presupuesto: 60000 },
  { id: '2', nombre: 'Transporte', emoji: '🚗', color: 'hsl(var(--secondary))', gastado: 32000, presupuesto: 40000 },
  { id: '3', nombre: 'Servicios', emoji: '💡', color: 'hsl(var(--accent))', gastado: 25000, presupuesto: 30000 },
  { id: '4', nombre: 'Entretenimiento', emoji: '🎮', color: 'hsl(var(--primary) / 0.7)', gastado: 18500, presupuesto: 25000 },
  { id: '5', nombre: 'Salud', emoji: '💊', color: 'hsl(var(--accent) / 0.7)', gastado: 15700, presupuesto: 20000 },
  { id: '6', nombre: 'Educación', emoji: '📚', color: 'hsl(var(--secondary) / 0.7)', gastado: 12300, presupuesto: 15000 },
  { id: '7', nombre: 'Hogar', emoji: '🏠', color: 'hsl(var(--primary) / 0.5)', gastado: 9200, presupuesto: 12000 },
  { id: '8', nombre: 'Otros', emoji: '🎁', color: 'hsl(var(--muted-foreground))', gastado: 5500, presupuesto: 8000 },
]

// Transacciones dummy
const DUMMY_TRANSACTIONS = [
  // 11 enero 2025
  { fecha: '2025-01-11', monto: 45000, categoria: 'Supermercado', subcategoria: 'Frutas y Verduras', descripcion: 'Compra semanal en Riba Smith' },
  { fecha: '2025-01-11', monto: 12500, categoria: 'Transporte', subcategoria: null, descripcion: null },
  { fecha: '2025-01-11', monto: 8300, categoria: 'Comida', subcategoria: 'Almuerzo', descripcion: 'Lunch en Food Court' },
  // 08 enero 2025
  { fecha: '2025-01-08', monto: 32000, categoria: 'Servicios', subcategoria: 'Internet', descripcion: null },
  { fecha: '2025-01-08', monto: 15700, categoria: 'Supermercado', subcategoria: 'Carnes', descripcion: 'Compras Super 99' },
  { fecha: '2025-01-08', monto: 9200, categoria: 'Entretenimiento', subcategoria: null, descripcion: null },
  { fecha: '2025-01-08', monto: 5500, categoria: 'Comida', subcategoria: 'Café', descripcion: null },
  // 01 enero 2025
  { fecha: '2025-01-01', monto: 120000, categoria: 'Hogar', subcategoria: 'Alquiler', descripcion: 'Pago de renta mensual' },
  { fecha: '2025-01-01', monto: 25000, categoria: 'Servicios', subcategoria: 'Electricidad', descripcion: null },
  { fecha: '2025-01-01', monto: 18500, categoria: 'Transporte', subcategoria: 'Gasolina', descripcion: 'Tanque lleno' },
]

export function SobreCard({
  sobre,
  categorias,
  transacciones,
  totalGastado,
}: SobreCardProps) {
  const presupuesto = sobre.presupuesto_asignado
  const porcentajeGastado = presupuesto > 0 ? (totalGastado / presupuesto) * 100 : 0
  const disponible = presupuesto - totalGastado
  const customLineColor = sobre.color || '#8b5cf6'

  // Agrupar transacciones por fecha
  const groupedTransactions = DUMMY_TRANSACTIONS.reduce((acc, tx) => {
    if (!acc[tx.fecha]) {
      acc[tx.fecha] = []
    }
    acc[tx.fecha].push(tx)
    return acc
  }, {} as Record<string, typeof DUMMY_TRANSACTIONS>)

  return (
    <div className="w-full h-full flex flex-col bg-background">
      {/* Envelope Container - Más ancho */}
      <div className="flex-1 overflow-y-auto p-3 pb-6">
        <div
          className="relative w-full max-w-2xl mx-auto"
          style={{
            filter: 'drop-shadow(0 20px 35px hsl(var(--primary) / 0.15))',
          }}
        >
          {/* Envelope Body - Usa colores del theme */}
          <div
            className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[hsl(var(--sobre-base))] to-[hsl(var(--sobre-base-dark))]"
            style={{
              boxShadow: '0 0 50px hsl(var(--primary) / 0.2), inset 0 2px 20px rgba(255,255,255,0.1)',
            }}
          >
            {/* Envelope Flap (solapa) - TRANSPARENTE con línea custom */}
            <div className="relative h-20 overflow-hidden">
              <svg
                viewBox="0 0 400 80"
                className="absolute inset-0 w-full h-full"
                preserveAspectRatio="none"
              >
                {/* Flap transparente */}
                <path
                  d="M 0 0 L 200 65 L 400 0 Z"
                  fill="hsl(var(--sobre-base) / 0.3)"
                />
                {/* Línea de cierre con color custom del usuario */}
                <path
                  d="M 0 0 L 200 65 L 400 0"
                  stroke={customLineColor}
                  strokeWidth="3"
                  fill="none"
                  opacity="0.8"
                />
              </svg>

              {/* NOMBRE en la solapa - más arriba para estar junto con presupuesto */}
              <div className="absolute top-2 left-0 right-0 z-10 flex items-center justify-center">
                <h2 className="text-2xl font-extrabold font-display text-foreground text-center px-4"
                  style={{
                    textShadow: '0 2px 10px hsl(var(--background) / 0.8)',
                  }}
                >
                  {sobre.nombre}
                </h2>
              </div>
            </div>

            {/* Envelope Content (DENTRO del sobre) */}
            <div className="relative p-4 pb-5 text-foreground space-y-3">
              {/* Balance Card - Compacta y pegada al título */}
              <div className="bg-card/80 backdrop-blur-md rounded-xl p-3 border border-border"
                style={{
                  boxShadow: '0 4px 15px hsl(var(--primary) / 0.1)',
                }}
              >
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div className="text-left">
                    <p className="text-[9px] text-muted-foreground font-semibold mb-0.5 tracking-wider">PRESUPUESTO</p>
                    <p className="text-lg font-extrabold font-display">
                      {formatCurrency(presupuesto)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] text-muted-foreground font-semibold mb-0.5 tracking-wider">GASTADO</p>
                    <p className="text-lg font-extrabold font-display">
                      {formatCurrency(totalGastado)}
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="relative w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${
                        porcentajeGastado > 100
                          ? 'bg-destructive'
                          : porcentajeGastado > 80
                          ? 'bg-accent'
                          : 'bg-primary'
                      }`}
                      style={{ width: `${Math.min(porcentajeGastado, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-1">
                      {disponible >= 0 ? (
                        <TrendingUp className="w-3 h-3 text-primary" />
                      ) : (
                        <TrendingDown className="w-3 h-3 text-destructive" />
                      )}
                      <span className="font-semibold text-muted-foreground">
                        {disponible >= 0 ? 'Disponible' : 'Excedido'}:{' '}
                        <span className={disponible >= 0 ? 'text-primary' : 'text-destructive'}>
                          {formatCurrency(Math.abs(disponible))}
                        </span>
                      </span>
                    </div>
                    <span className="font-semibold text-muted-foreground">
                      {porcentajeGastado.toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Gráfico Pie de Categorías - 70% del sobre */}
              <div className="bg-card/60 backdrop-blur-sm rounded-2xl p-4 border border-border"
                style={{
                  boxShadow: '0 6px 20px hsl(var(--primary) / 0.08)',
                  minHeight: '320px',
                }}
              >
                <p className="text-[9px] text-muted-foreground font-bold text-center tracking-widest mb-2">
                  DISTRIBUCIÓN
                </p>
                <div className="flex items-center justify-center">
                  <CirculoCategoriasGastos categorias={DUMMY_CATEGORIAS} size={300} />
                </div>
              </div>
            </div>

            {/* Envelope Bottom Seal */}
            <div
              className="h-3 bg-gradient-to-b from-[hsl(var(--sobre-base-dark))] to-[hsl(var(--sobre-base-dark)_/_0.8)]"
              style={{
                boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.2)',
              }}
            />
          </div>
        </div>

        {/* Transacciones FUERA del sobre - Con bg-card */}
        {DUMMY_TRANSACTIONS.length > 0 && (
          <div className="mt-6 px-2">
            <h3 className="text-base font-bold text-foreground mb-3 font-display">
              Transacciones Recientes
            </h3>
            <div className="bg-card rounded-2xl border border-border overflow-hidden"
              style={{
                boxShadow: '0 8px 25px hsl(var(--primary) / 0.08)',
              }}
            >
              <div className="p-3 space-y-3">
                {Object.entries(groupedTransactions).map(([fecha, txs]) => (
                  <div key={fecha} className="space-y-2">
                    {/* Fecha Header */}
                    <p className="text-sm font-bold text-foreground bg-muted/50 py-1 px-2 rounded-lg">
                      {formatDate(fecha)}
                    </p>
                    {/* Transacciones de esa fecha */}
                    {txs.map((tx, idx) => (
                      <div key={`${fecha}-${idx}`} className="bg-muted/30 rounded-lg p-2.5 border border-border/50">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-bold text-foreground">{formatCurrency(tx.monto)}</span>
                              <span className="text-sm text-muted-foreground">{tx.categoria}</span>
                              {tx.subcategoria && (
                                <span className="text-xs text-muted-foreground">→ {tx.subcategoria}</span>
                              )}
                            </div>
                            {tx.descripcion && (
                              <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">{tx.descripcion}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Helper Functions
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-PA', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-')
  const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
  return `${parseInt(day)} ${months[parseInt(month) - 1]} ${year}`
}
