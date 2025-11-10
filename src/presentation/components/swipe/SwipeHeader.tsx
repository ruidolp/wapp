'use client'

import { Layers } from 'lucide-react'

interface SwipeHeaderProps {
  items: {
    id: string
    name: string
  }[]
  activeIndex: number
  onComponentsClick?: () => void
}

export function SwipeHeader({ items, activeIndex, onComponentsClick }: SwipeHeaderProps) {
  // Calcular índices para los títulos superpuestos
  const getPrevIndex = () => (activeIndex - 1 + items.length) % items.length
  const getNextIndex = () => (activeIndex + 1) % items.length

  const prevIndex = getPrevIndex()
  const nextIndex = getNextIndex()

  return (
    <div className="relative w-full pt-6 pb-4 px-4 bg-gradient-to-b from-white/95 via-white/90 to-transparent backdrop-blur-md border-b border-slate-200/50 shadow-lg">
      {/* Botón COMPONENTES - Top Left */}
      <button
        onClick={onComponentsClick}
        className="absolute top-4 left-4 flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-md hover:shadow-xl transition-all border border-slate-200 hover:border-slate-300 group"
      >
        <Layers className="w-4 h-4 text-slate-600 group-hover:text-slate-900 transition-colors" />
        <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 font-display">
          COMPONENTES
        </span>
      </button>

      {/* Títulos Superpuestos - Centrados */}
      <div className="relative h-20 flex items-center justify-center mt-8">
        {/* Título Anterior (izquierda, más pequeño) */}
        <div
          className="absolute left-1/4 transform -translate-x-1/2 transition-all duration-300 opacity-30 scale-75"
          style={{ zIndex: 1 }}
        >
          <h2 className="text-xl font-bold text-slate-600 font-display whitespace-nowrap">
            {items[prevIndex]?.name}
          </h2>
        </div>

        {/* Título Activo (centro, más grande) */}
        <div
          className="relative transition-all duration-300"
          style={{ zIndex: 3 }}
        >
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 font-display tracking-tight drop-shadow-sm">
            {items[activeIndex]?.name}
          </h1>
        </div>

        {/* Título Siguiente (derecha, más pequeño) */}
        <div
          className="absolute right-1/4 transform translate-x-1/2 transition-all duration-300 opacity-30 scale-75"
          style={{ zIndex: 1 }}
        >
          <h2 className="text-xl font-bold text-slate-600 font-display whitespace-nowrap">
            {items[nextIndex]?.name}
          </h2>
        </div>
      </div>

      {/* Indicadores de Swipe (Dots) */}
      <div className="flex items-center justify-center gap-2 mt-4">
        {items.map((_, index) => (
          <div
            key={index}
            className={`transition-all duration-300 rounded-full ${
              index === activeIndex
                ? 'w-8 h-2 bg-gradient-to-r from-blue-500 to-purple-500 shadow-md'
                : 'w-2 h-2 bg-slate-300 hover:bg-slate-400'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
