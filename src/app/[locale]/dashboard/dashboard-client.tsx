'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Monitor, LogOut } from 'lucide-react'
import {
  SwipeContainer,
  SwipeItem,
  SwipeHeader,
  SwipeIndicators,
  BilleterasCard,
  SobreCard,
  FloatingActionButton,
} from '@/components/swipe'
import type { CategoriaGasto } from '@/components/swipe'
import type { Billetera, Sobre, Transaccion } from '@/domain/types'
import {
  OnboardingDrawer,
  CrearBilleteraDrawer,
  CrearSobreDrawer,
  ProfileDrawer,
} from '@/components/drawers'
import { signOut } from 'next-auth/react'

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
  hasUserConfig: boolean
}

export function DashboardClient({
  locale,
  user,
  billeteras,
  sobresConDatos,
  hasUserConfig,
}: DashboardClientProps) {
  const router = useRouter()
  const [activeIndex, setActiveIndex] = useState(0)
  const [isMobile, setIsMobile] = useState<boolean | null>(null)
  const [showCrearBilletera, setShowCrearBilletera] = useState(false)
  const [showCrearSobre, setShowCrearSobre] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(!hasUserConfig)
  const [showProfile, setShowProfile] = useState(false)

  // Detectar si es mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Logout
  const handleLogout = async () => {
    await signOut({ callbackUrl: `/${locale}/auth/login` })
  }

  // Construir items del swipe
  const swipeItems: SwipeItem[] = [
    // Primera card: BILLETERAS
    {
      id: 'billeteras',
      name: 'BILLETERAS',
      content: (
        <BilleterasCard
          billeteras={billeteras}
          onClickCuenta={(billetera) => {
            console.log('Click en cuenta:', billetera.nombre)
          }}
        />
      ),
    },
    // Resto de cards: SOBRES
    ...sobresConDatos.map(({ sobre, categorias, transacciones, totalGastado }) => ({
      id: sobre.id,
      name: sobre.nombre.toUpperCase(),
      content: (
        <SobreCard
          sobre={sobre}
          categorias={categorias}
          transacciones={transacciones}
          totalGastado={totalGastado}
        />
      ),
    })),
  ]

  // Determinar tipo de componente activo
  const activeComponentType = activeIndex === 0 ? 'billeteras' : 'sobre'

  // Loading mientras detecta viewport
  if (isMobile === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 animate-pulse shadow-2xl" />
          <p className="text-lg font-semibold text-slate-700 font-display">Cargando...</p>
        </div>
      </div>
    )
  }

  // Vista Desktop
  if (!isMobile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-8">
        <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl p-12 text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-xl">
            <Monitor className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 mb-4 font-display">
            Vista Desktop en Desarrollo
          </h1>
          <p className="text-lg text-slate-600 mb-8">
            La interfaz de escritorio está planificada para una próxima fase.
            Por ahora, la aplicación está optimizada para dispositivos móviles.
          </p>
          <div className="mt-8 pt-6 border-t border-slate-200">
            <p className="text-sm text-slate-500">
              Usuario:{' '}
              <span className="font-medium text-slate-700 font-display">
                {user.name || user.email}
              </span>
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Vista Mobile: Nueva estructura con Header + Swipe + Indicators + FAB
  return (
    <>
      <div className="relative w-full h-screen bg-gradient-to-br from-slate-50 to-white flex flex-col">
        {/* Header compacto con perfil y theme */}
        <SwipeHeader
          items={swipeItems.map((item) => ({ id: item.id, name: item.name }))}
          activeIndex={activeIndex}
          onProfileClick={() => setShowProfile(true)}
        />

        {/* Swipe Container - Flex 1 para ocupar espacio disponible */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-hidden">
            <SwipeContainer
              items={swipeItems}
              initialIndex={0}
              onIndexChange={setActiveIndex}
            />
          </div>

          {/* Indicadores debajo del sobre */}
          {activeComponentType === 'sobre' && (
            <SwipeIndicators totalItems={swipeItems.length} activeIndex={activeIndex} />
          )}
        </div>

        {/* FAB Floating Action Button - Condicional */}
        <FloatingActionButton
          type={activeComponentType}
          onCrearCuenta={() => setShowCrearBilletera(true)}
          onCrearSobre={() => setShowCrearSobre(true)}
          onTransferir={() => {
            console.log('Transferir')
          }}
          onRegistrarGasto={() => {
            console.log('Registrar gasto')
          }}
        />
      </div>

      {/* Drawers */}
      <ProfileDrawer
        open={showProfile}
        onOpenChange={setShowProfile}
        userName={user.name}
        userEmail={user.email}
        onLogout={handleLogout}
      />
      <CrearBilleteraDrawer
        open={showCrearBilletera}
        onOpenChange={setShowCrearBilletera}
        userId={user.id}
      />
      <CrearSobreDrawer
        open={showCrearSobre}
        onOpenChange={setShowCrearSobre}
        userId={user.id}
      />
      <OnboardingDrawer open={showOnboarding} onOpenChange={setShowOnboarding} />
    </>
  )
}
