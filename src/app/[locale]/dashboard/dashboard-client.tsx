'use client'

import { useState } from 'react'
import { Menu } from 'lucide-react'
import { SwipeContainer, SwipeItem, BilleterasCard, SobreCard } from '@/components/swipe'
import type { CategoriaGasto } from '@/components/swipe'
import type { Billetera, Sobre, Transaccion } from '@/domain/types'

interface User {
  id: string
  name?: string | null
  email?: string | null
}

interface SobreConDatos {
  sobre: Sobre
  categorias: CategoriaGasto[]
  transacciones: Transaccion[]
  totalGastado: number
}

interface DashboardClientProps {
  locale: string
  user: User
  billeteras: Billetera[]
  sobresConDatos: SobreConDatos[]
}

export function DashboardClient({
  locale,
  user,
  billeteras,
  sobresConDatos,
}: DashboardClientProps) {
  const [activeIndex, setActiveIndex] = useState(0)

  // Construir items del swipe
  const swipeItems: SwipeItem[] = [
    // Primera card: BILLETERAS
    {
      id: 'billeteras',
      name: 'BILLETERAS',
      content: (
        <BilleterasCard
          billeteras={billeteras}
          onNuevaCuenta={() => {
            console.log('Nueva cuenta')
            // TODO: Abrir modal/página de nueva cuenta
          }}
          onTransferir={() => {
            console.log('Transferir')
            // TODO: Abrir modal/página de transferencia
          }}
          onClickCuenta={(billetera) => {
            console.log('Click en cuenta:', billetera.nombre)
            // TODO: Abrir detalle de cuenta
          }}
        />
      ),
    },
    // Resto de cards: SOBRES
    ...sobresConDatos.map(({ sobre, categorias, transacciones, totalGastado }) => ({
      id: sobre.id,
      name: sobre.nombre.toUpperCase(),
      color: sobre.color || undefined,
      content: (
        <SobreCard
          sobre={sobre}
          categorias={categorias}
          transacciones={transacciones}
          totalGastado={totalGastado}
          onRegistrarGasto={() => {
            console.log('Registrar gasto en:', sobre.nombre)
            // TODO: Abrir modal/página de registrar gasto
          }}
        />
      ),
    })),
  ]

  return (
    <div className="relative w-full h-screen bg-slate-50">
      {/* Hamburger Menu Icon - Top Left */}
      <div className="absolute top-4 left-4 z-50">
        <button
          className="w-10 h-10 rounded-lg bg-white/80 backdrop-blur-sm shadow-md border border-slate-200 flex items-center justify-center hover:bg-white transition-all"
          onClick={() => {
            console.log('Menu clicked')
            // TODO: Abrir menú lateral
          }}
          aria-label="Menu"
        >
          <Menu className="w-5 h-5 text-slate-700" />
        </button>
      </div>

      {/* Swipe Container */}
      <SwipeContainer
        items={swipeItems}
        initialIndex={0}
        onIndexChange={setActiveIndex}
      />
    </div>
  )
}
