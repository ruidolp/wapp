'use client'

import { useState, useEffect } from 'react'
import { Menu, Monitor, Smartphone } from 'lucide-react'
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
  const [isMobile, setIsMobile] = useState(false)

  // Detectar si es mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    // Check inicial
    checkMobile()

    // Escuchar cambios de tamaño
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

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

  // Vista Desktop: Placeholder
  if (!isMobile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-8">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-12 text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Monitor className="w-12 h-12 text-white" />
          </div>

          <h1 className="text-3xl font-bold text-slate-900 mb-4">
            Vista Desktop en Desarrollo
          </h1>

          <p className="text-lg text-slate-600 mb-6">
            La interfaz de escritorio está planificada para una próxima fase.
            Por ahora, la aplicación está optimizada para dispositivos móviles.
          </p>

          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-center gap-3 mb-3">
              <Smartphone className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-blue-900">
                Vista Previa Mobile
              </h3>
            </div>
            <p className="text-sm text-blue-800">
              Para ver la interfaz mobile, redimensiona tu ventana a menos de 768px de ancho
              o accede desde un dispositivo móvil.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <div className="bg-slate-50 rounded-lg p-4">
              <h4 className="font-semibold text-slate-900 mb-2">✓ Implementado (Mobile)</h4>
              <ul className="text-sm text-slate-600 space-y-1">
                <li>• Navegación swipe horizontal</li>
                <li>• Gestión de billeteras</li>
                <li>• Presupuesto por sobres</li>
                <li>• Gráficos de categorías</li>
                <li>• Lista de transacciones</li>
              </ul>
            </div>
            <div className="bg-slate-50 rounded-lg p-4">
              <h4 className="font-semibold text-slate-900 mb-2">⏳ Próximamente</h4>
              <ul className="text-sm text-slate-600 space-y-1">
                <li>• Vista de escritorio</li>
                <li>• Dashboard ampliado</li>
                <li>• Gráficos avanzados</li>
                <li>• Reportes detallados</li>
                <li>• Multi-panel</li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-200">
            <p className="text-sm text-slate-500">
              Usuario: <span className="font-medium text-slate-700">{user.name || user.email}</span>
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Vista Mobile: Swipe Navigation
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
