'use client'

import { useState } from 'react'
import { Plus, Wallet, Mail, ArrowRightLeft, Menu } from 'lucide-react'

interface FloatingActionButtonProps {
  type: 'billeteras' | 'sobres'
  onCrearCuenta?: () => void
  onCrearSobre?: () => void
  onTransferir?: () => void
  onRegistrarGasto?: () => void
}

export function FloatingActionButton({
  type,
  onCrearCuenta,
  onCrearSobre,
  onTransferir,
  onRegistrarGasto,
}: FloatingActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleToggle = () => {
    setIsOpen(!isOpen)
  }

  const handleAction = (action?: () => void) => {
    action?.()
    setIsOpen(false)
  }

  // FAB simple para sobres (solo botón +)
  if (type === 'sobres') {
    return (
      <button
        onClick={onRegistrarGasto}
        className="fixed right-6 bottom-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] flex items-center justify-center shadow-2xl hover:shadow-3xl transition-all hover:scale-110 active:scale-95"
        style={{
          boxShadow: '0 8px 30px hsl(var(--primary) / 0.5), 0 0 20px hsl(var(--accent) / 0.3)',
        }}
        aria-label="Registrar Gasto"
      >
        <Plus className="w-7 h-7 text-primary-foreground" />
      </button>
    )
  }

  // FAB con menú desplegable para billeteras
  return (
    <>
      {/* Backdrop transparente cuando el menú está abierto */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div className="fixed right-6 bottom-6 z-50">
      {/* Botones Expandidos */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 flex flex-col gap-3 mb-2">
          {/* Botón Transferir */}
          <button
            onClick={() => handleAction(onTransferir)}
            className="group relative flex items-center gap-3"
          >
            <span className="px-3 py-1.5 rounded-lg bg-card border border-border text-foreground text-sm font-semibold whitespace-nowrap shadow-lg">
              Transferir
            </span>
            <div
              className="w-12 h-12 rounded-full bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] flex items-center justify-center shadow-lg hover:shadow-2xl transition-all hover:scale-110"
              style={{
                boxShadow: '0 6px 20px hsl(var(--primary) / 0.4)',
              }}
            >
              <ArrowRightLeft className="w-5 h-5 text-primary-foreground" />
            </div>
          </button>

          {/* Botón Crear Sobre */}
          <button
            onClick={() => handleAction(onCrearSobre)}
            className="group relative flex items-center gap-3"
          >
            <span className="px-3 py-1.5 rounded-lg bg-card border border-border text-foreground text-sm font-semibold whitespace-nowrap shadow-lg">
              Crear Sobre
            </span>
            <div
              className="w-12 h-12 rounded-full bg-gradient-to-br from-[hsl(var(--secondary))] to-[hsl(var(--accent))] flex items-center justify-center shadow-lg hover:shadow-2xl transition-all hover:scale-110"
              style={{
                boxShadow: '0 6px 20px hsl(var(--secondary) / 0.4)',
              }}
            >
              <Mail className="w-5 h-5 text-primary-foreground" />
            </div>
          </button>

          {/* Botón Crear Cuenta */}
          <button
            onClick={() => handleAction(onCrearCuenta)}
            className="group relative flex items-center gap-3"
          >
            <span className="px-3 py-1.5 rounded-lg bg-card border border-border text-foreground text-sm font-semibold whitespace-nowrap shadow-lg">
              Crear Cuenta
            </span>
            <div
              className="w-12 h-12 rounded-full bg-gradient-to-br from-[hsl(var(--accent))] to-[hsl(var(--primary))] flex items-center justify-center shadow-lg hover:shadow-2xl transition-all hover:scale-110"
              style={{
                boxShadow: '0 6px 20px hsl(var(--accent) / 0.4)',
              }}
            >
              <Wallet className="w-5 h-5 text-primary-foreground" />
            </div>
          </button>
        </div>
      )}

      {/* Botón Principal (Sandwich/Hamburger Icon) */}
      <button
        onClick={handleToggle}
        className="relative w-14 h-14 rounded-full bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] flex items-center justify-center shadow-2xl hover:shadow-3xl transition-all hover:scale-110 active:scale-95"
        style={{
          boxShadow: '0 8px 30px hsl(var(--primary) / 0.5), 0 0 20px hsl(var(--accent) / 0.3)',
        }}
        aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}
      >
        {/* Halo effect */}
        <div
          className="absolute inset-0 rounded-full opacity-50 blur-2xl"
          style={{
            background: `linear-gradient(to bottom right, hsl(var(--primary) / 0.6), hsl(var(--accent) / 0.6))`,
          }}
        />

        {/* Icon - Animated transition between Menu and X */}
        <div className="relative z-10">
          {isOpen ? (
            <Plus className="w-7 h-7 text-primary-foreground rotate-45 transition-transform duration-300" />
          ) : (
            <Menu className="w-7 h-7 text-primary-foreground transition-transform duration-300" />
          )}
        </div>
      </button>
    </div>
    </>
  )
}
