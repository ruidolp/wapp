'use client'

import { Plus, ArrowRightLeft } from 'lucide-react'

interface SwipeFooterProps {
  componentType: 'billeteras' | 'sobre'
  onNuevaCuenta?: () => void
  onCrearSobre?: () => void
  onTransferir?: () => void
  onRegistrarGasto?: () => void
}

export function SwipeFooter({
  componentType,
  onNuevaCuenta,
  onCrearSobre,
  onTransferir,
  onRegistrarGasto,
}: SwipeFooterProps) {
  if (componentType === 'billeteras') {
    return (
      <div className="fixed bottom-0 left-0 right-0 w-full px-6 py-3 bg-gradient-to-t from-background via-background/95 to-transparent backdrop-blur-md z-40"
        style={{
          boxShadow: '0 -4px 20px hsl(var(--primary) / 0.08)',
        }}
      >
        <div className="flex items-center justify-center gap-3">
          {/* Botón Nueva Cuenta */}
          <button
            onClick={onNuevaCuenta}
            className="group relative px-6 py-3 rounded-2xl bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] hover:opacity-90 shadow-lg hover:shadow-2xl transform hover:-translate-y-1 hover:scale-105 transition-all"
            style={{
              boxShadow: '0 8px 25px hsl(var(--primary) / 0.4), 0 0 20px hsl(var(--accent) / 0.2)',
            }}
          >
            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 blur-2xl transition-opacity"
              style={{
                background: `linear-gradient(to bottom right, hsl(var(--primary) / 0.6), hsl(var(--accent) / 0.6))`,
              }}
            />
            <div className="relative flex items-center gap-2 text-primary-foreground font-semibold font-display">
              <Plus className="w-5 h-5" />
              <span>Cuenta</span>
            </div>
          </button>

          {/* Botón Crear Sobre */}
          <button
            onClick={onCrearSobre}
            className="group relative px-6 py-3 rounded-2xl bg-gradient-to-br from-[hsl(var(--secondary))] to-[hsl(var(--accent))] hover:opacity-90 shadow-lg hover:shadow-2xl transform hover:-translate-y-1 hover:scale-105 transition-all"
            style={{
              boxShadow: '0 8px 25px hsl(var(--secondary) / 0.4), 0 0 20px hsl(var(--accent) / 0.2)',
            }}
          >
            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 blur-2xl transition-opacity"
              style={{
                background: `linear-gradient(to bottom right, hsl(var(--secondary) / 0.6), hsl(var(--accent) / 0.6))`,
              }}
            />
            <div className="relative flex items-center gap-2 text-primary-foreground font-semibold font-display">
              <Plus className="w-5 h-5" />
              <span>Sobre</span>
            </div>
          </button>

          {/* Botón Transferir */}
          <button
            onClick={onTransferir}
            className="group relative px-6 py-3 rounded-2xl bg-card hover:bg-muted shadow-lg hover:shadow-2xl border-2 border-border hover:border-primary transform hover:-translate-y-1 hover:scale-105 transition-all"
            style={{
              boxShadow: '0 8px 20px hsl(var(--primary) / 0.15)',
            }}
          >
            <div className="flex items-center gap-2 text-foreground font-semibold font-display">
              <ArrowRightLeft className="w-5 h-5" />
              <span>Mover</span>
            </div>
          </button>
        </div>
      </div>
    )
  }

  // Footer para Sobres
  return (
    <div className="fixed bottom-0 left-0 right-0 w-full px-6 py-3 bg-gradient-to-t from-background via-background/95 to-transparent backdrop-blur-md z-40"
      style={{
        boxShadow: '0 -4px 20px hsl(var(--primary) / 0.08)',
      }}
    >
      <div className="flex items-center justify-center">
        <button
          onClick={onRegistrarGasto}
          className="group relative px-8 py-3.5 rounded-2xl bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] hover:opacity-90 shadow-lg hover:shadow-2xl transform hover:-translate-y-1 hover:scale-105 transition-all"
          style={{
            boxShadow: '0 8px 25px hsl(var(--primary) / 0.4), 0 0 20px hsl(var(--accent) / 0.2)',
          }}
        >
          <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 blur-2xl transition-opacity"
            style={{
              background: `linear-gradient(to bottom right, hsl(var(--primary) / 0.6), hsl(var(--accent) / 0.6))`,
            }}
          />
          <div className="relative flex items-center gap-2 text-primary-foreground font-bold font-display">
            <Plus className="w-6 h-6" />
            <span className="text-lg">Registrar Gasto</span>
          </div>
        </button>
      </div>
    </div>
  )
}
