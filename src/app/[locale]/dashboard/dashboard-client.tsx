'use client'

import { useState } from 'react'
import { AppShell } from '@/presentation/components/layout/AppShell'
import { Header } from '@/presentation/components/layout/Header'
import { BottomNav, type TabType } from '@/presentation/components/layout/BottomNav'
import { BilleterasScreen } from '@/presentation/components/screens/BilleterasScreen'
import { SobresScreen } from '@/presentation/components/screens/SobresScreen'
import { MetricasScreen } from '@/presentation/components/screens/MetricasScreen'
import { ConfigScreen } from '@/presentation/components/screens/ConfigScreen'

interface User {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
}

interface DashboardClientProps {
  locale: string
  user: User
}

export function DashboardClient({ locale, user }: DashboardClientProps) {
  const [activeTab, setActiveTab] = useState<TabType>('billeteras')

  // Acción contextual del botón central (+)
  const handleContextualAction = () => {
    alert(`Acción contextual para: ${activeTab.toUpperCase()}`)
  }

  // Renderizar screen según tab activo
  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'billeteras':
        return <BilleterasScreen />
      case 'sobres':
        return <SobresScreen />
      case 'metricas':
        return <MetricasScreen />
      case 'config':
        return <ConfigScreen />
      default:
        return <BilleterasScreen />
    }
  }

  return (
    <AppShell
      header={
        <Header
          userName={user.name}
          userImage={user.image}
        />
      }
      footer={
        <BottomNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onContextualAction={handleContextualAction}
        />
      }
    >
      {renderActiveScreen()}
    </AppShell>
  )
}
