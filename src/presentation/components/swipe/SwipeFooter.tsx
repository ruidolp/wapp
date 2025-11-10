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
      <div className="relative w-full px-6 py-5 bg-gradient-to-t from-white via-white/95 to-transparent backdrop-blur-md border-t border-slate-200/50">
        <div className="flex items-center justify-center gap-3">
          {/* Botón Nueva Cuenta */}
          <button
            onClick={onNuevaCuenta}
            className="group relative px-6 py-3 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
          >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-400 to-purple-400 opacity-0 group-hover:opacity-100 blur-xl transition-opacity" />
            <div className="relative flex items-center gap-2 text-white font-semibold font-display">
              <Plus className="w-5 h-5" />
              <span>Cuenta</span>
            </div>
          </button>

          {/* Botón Crear Sobre */}
          <button
            onClick={onCrearSobre}
            className="group relative px-6 py-3 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
          >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-400 opacity-0 group-hover:opacity-100 blur-xl transition-opacity" />
            <div className="relative flex items-center gap-2 text-white font-semibold font-display">
              <Plus className="w-5 h-5" />
              <span>Sobre</span>
            </div>
          </button>

          {/* Botón Transferir */}
          <button
            onClick={onTransferir}
            className="group relative px-6 py-3 rounded-2xl bg-white hover:bg-slate-50 shadow-lg hover:shadow-xl border-2 border-slate-200 hover:border-slate-300 transform hover:-translate-y-0.5 transition-all"
          >
            <div className="flex items-center gap-2 text-slate-700 font-semibold font-display">
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
    <div className="relative w-full px-6 py-5 bg-gradient-to-t from-white via-white/95 to-transparent backdrop-blur-md border-t border-slate-200/50">
      <div className="flex items-center justify-center">
        <button
          onClick={onRegistrarGasto}
          className="group relative px-8 py-3.5 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-lg hover:shadow-2xl transform hover:-translate-y-0.5 transition-all"
        >
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-400 opacity-0 group-hover:opacity-100 blur-xl transition-opacity" />
          <div className="relative flex items-center gap-2 text-white font-bold font-display">
            <Plus className="w-6 h-6" />
            <span className="text-lg">Registrar Gasto</span>
          </div>
        </button>
      </div>
    </div>
  )
}
