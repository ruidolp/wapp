/**
 * Components Showcase Page
 *
 * Página temporal para demostrar todas las librerías de UI recomendadas.
 * Para eliminar este demo, simplemente borrar esta carpeta.
 */

'use client'

import { useState } from 'react'
import {
  House,
  User,
  Gear,
  ChartLine,
  Bell,
  MagnifyingGlass,
  Heart,
  ShoppingCart,
  ChatCircle,
  Camera,
  Lightning,
  Star
} from '@phosphor-icons/react'
import {
  IconBrandGoogle,
  IconChartPie,
  IconTrendingUp,
  IconUsers,
  IconShoppingBag
} from '@tabler/icons-react'
import { motion } from 'framer-motion'
import { Drawer } from 'vaul'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { ClipLoader, PulseLoader, BeatLoader } from 'react-spinners'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

// Carousel imports
import useEmblaCarousel from 'embla-carousel-react'

// Recharts imports
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts'

export default function ShowcasePage() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
                Components Showcase
              </h1>
              <p className="text-sm text-muted-foreground">
                Demo de librerías modernas UI/UX
              </p>
            </div>
            <Badge variant="outline" className="hidden md:flex">
              {format(new Date(), "PPP", { locale: es })}
            </Badge>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 space-y-12">

        {/* 1. PHOSPHOR ICONS */}
        <section>
          <div className="mb-6">
            <h2 className="text-3xl font-bold mb-2">1. Phosphor Icons</h2>
            <p className="text-muted-foreground">
              6,000+ iconos modernos con 6 estilos diferentes (thin, light, regular, bold, fill, duotone)
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Regular Weight</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  <House size={32} />
                  <User size={32} />
                  <Gear size={32} />
                  <ChartLine size={32} />
                  <Bell size={32} />
                  <MagnifyingGlass size={32} />
                  <Heart size={32} />
                  <ShoppingCart size={32} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Bold Weight</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  <House size={32} weight="bold" />
                  <User size={32} weight="bold" />
                  <Gear size={32} weight="bold" />
                  <ChartLine size={32} weight="bold" />
                  <Bell size={32} weight="bold" />
                  <MagnifyingGlass size={32} weight="bold" />
                  <Heart size={32} weight="bold" />
                  <ShoppingCart size={32} weight="bold" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Duotone Weight</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  <House size={32} weight="duotone" className="text-blue-600" />
                  <User size={32} weight="duotone" className="text-green-600" />
                  <Gear size={32} weight="duotone" className="text-orange-600" />
                  <ChartLine size={32} weight="duotone" className="text-purple-600" />
                  <Bell size={32} weight="duotone" className="text-red-600" />
                  <MagnifyingGlass size={32} weight="duotone" className="text-cyan-600" />
                  <Heart size={32} weight="duotone" className="text-pink-600" />
                  <ShoppingCart size={32} weight="duotone" className="text-yellow-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-lg">Todos los Pesos Disponibles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
                <div className="flex flex-col items-center gap-2">
                  <Heart size={48} weight="thin" className="text-red-500" />
                  <span className="text-sm">Thin</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Heart size={48} weight="light" className="text-red-500" />
                  <span className="text-sm">Light</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Heart size={48} weight="regular" className="text-red-500" />
                  <span className="text-sm">Regular</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Heart size={48} weight="bold" className="text-red-500" />
                  <span className="text-sm">Bold</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Heart size={48} weight="fill" className="text-red-500" />
                  <span className="text-sm">Fill</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Heart size={48} weight="duotone" className="text-red-500" />
                  <span className="text-sm">Duotone</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 2. TABLER ICONS */}
        <section>
          <div className="mb-6">
            <h2 className="text-3xl font-bold mb-2">2. Tabler Icons</h2>
            <p className="text-muted-foreground">
              5,000+ iconos outline style, perfecto para dashboards y complemento de Phosphor
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Iconos de Tabler</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="flex flex-col items-center gap-2">
                  <IconBrandGoogle size={48} stroke={1.5} className="text-blue-600" />
                  <span className="text-sm">Brand Google</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <IconChartPie size={48} stroke={1.5} className="text-green-600" />
                  <span className="text-sm">Chart Pie</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <IconTrendingUp size={48} stroke={1.5} className="text-orange-600" />
                  <span className="text-sm">Trending Up</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <IconUsers size={48} stroke={1.5} className="text-purple-600" />
                  <span className="text-sm">Users</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 3. EMBLA CAROUSEL */}
        <section>
          <div className="mb-6">
            <h2 className="text-3xl font-bold mb-2">3. Embla Carousel (Swipe)</h2>
            <p className="text-muted-foreground">
              Carousel ultra ligero (3kb) con gestos táctiles nativos
            </p>
          </div>

          <CarouselDemo />
        </section>

        {/* 4. RECHARTS */}
        <section>
          <div className="mb-6">
            <h2 className="text-3xl font-bold mb-2">4. Recharts - Gráficos</h2>
            <p className="text-muted-foreground">
              Gráficos modernos basados en D3 con componentes React nativos
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartsDemo />
          </div>
        </section>

        {/* 5. FRAMER MOTION */}
        <section>
          <div className="mb-6">
            <h2 className="text-3xl font-bold mb-2">5. Framer Motion</h2>
            <p className="text-muted-foreground">
              Animaciones fluidas y gestos táctiles
            </p>
          </div>

          <AnimationsDemo />
        </section>

        {/* 6. VAUL (Bottom Drawer) */}
        <section>
          <div className="mb-6">
            <h2 className="text-3xl font-bold mb-2">6. Vaul - Bottom Sheet</h2>
            <p className="text-muted-foreground">
              Drawer desde abajo con gestos nativos (iOS/Android style)
            </p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <Button
                onClick={() => setIsDrawerOpen(true)}
                className="w-full"
              >
                Abrir Bottom Sheet
              </Button>
            </CardContent>
          </Card>

          <Drawer.Root open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
            <Drawer.Portal>
              <Drawer.Overlay className="fixed inset-0 bg-black/40" />
              <Drawer.Content className="bg-white dark:bg-slate-900 flex flex-col rounded-t-[10px] h-[80%] mt-24 fixed bottom-0 left-0 right-0">
                <div className="p-4 bg-white dark:bg-slate-900 rounded-t-[10px] flex-1 overflow-y-auto">
                  <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-slate-300 mb-8" />
                  <div className="max-w-md mx-auto">
                    <Drawer.Title className="font-bold text-2xl mb-4">
                      Bottom Sheet Demo
                    </Drawer.Title>
                    <Drawer.Description className="text-muted-foreground mb-6">
                      Puedes hacer swipe hacia abajo para cerrar o usar gestos táctiles
                    </Drawer.Description>
                    <div className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle>Contenido del Drawer</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">
                            Este componente funciona perfecto en iOS y Android con gestos nativos.
                            Incluye snap points, momentum scrolling y haptic feedback.
                          </p>
                        </CardContent>
                      </Card>
                      <Button
                        onClick={() => setIsDrawerOpen(false)}
                        variant="outline"
                        className="w-full"
                      >
                        Cerrar
                      </Button>
                    </div>
                  </div>
                </div>
              </Drawer.Content>
            </Drawer.Portal>
          </Drawer.Root>
        </section>

        {/* 7. SPINNERS */}
        <section>
          <div className="mb-6">
            <h2 className="text-3xl font-bold mb-2">7. React Spinners</h2>
            <p className="text-muted-foreground">
              Loaders modernos y livianos
            </p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap items-center justify-around gap-8">
                <div className="flex flex-col items-center gap-2">
                  <ClipLoader color="#3b82f6" size={50} />
                  <span className="text-sm">Clip Loader</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <PulseLoader color="#10b981" size={15} />
                  <span className="text-sm">Pulse Loader</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <BeatLoader color="#f59e0b" size={15} />
                  <span className="text-sm">Beat Loader</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Footer */}
        <Card className="bg-gradient-to-r from-blue-500 to-violet-500 text-white border-0">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-xl font-bold mb-2">
                ✨ Stack Moderno y Optimizado
              </h3>
              <p className="text-white/90 mb-4">
                Todas estas librerías están optimizadas para mobile, Capacitor y desktop
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <Badge variant="secondary">Embla Carousel</Badge>
                <Badge variant="secondary">Phosphor Icons</Badge>
                <Badge variant="secondary">Tabler Icons</Badge>
                <Badge variant="secondary">Recharts</Badge>
                <Badge variant="secondary">Framer Motion</Badge>
                <Badge variant="secondary">Vaul</Badge>
                <Badge variant="secondary">React Spinners</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Carousel Component
function CarouselDemo() {
  const [emblaRef] = useEmblaCarousel({ loop: true, align: 'start' })

  const slides = [
    { id: 1, color: 'from-blue-400 to-blue-600', title: 'Slide 1', icon: Camera },
    { id: 2, color: 'from-purple-400 to-purple-600', title: 'Slide 2', icon: Lightning },
    { id: 3, color: 'from-pink-400 to-pink-600', title: 'Slide 3', icon: Star },
    { id: 4, color: 'from-orange-400 to-orange-600', title: 'Slide 4', icon: ChatCircle },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Swipe Horizontal</CardTitle>
        <CardDescription>Desliza hacia los lados (touch o mouse)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-4">
            {slides.map((slide) => (
              <div key={slide.id} className="flex-[0_0_80%] md:flex-[0_0_45%] lg:flex-[0_0_30%]">
                <div className={`bg-gradient-to-br ${slide.color} rounded-xl p-8 text-white h-64 flex flex-col items-center justify-center`}>
                  <slide.icon size={64} weight="duotone" />
                  <h3 className="text-2xl font-bold mt-4">{slide.title}</h3>
                  <p className="text-white/80 mt-2">Swipe para ver más</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Charts Component
function ChartsDemo() {
  const lineData = [
    { name: 'Ene', ventas: 4000, gastos: 2400 },
    { name: 'Feb', ventas: 3000, gastos: 1398 },
    { name: 'Mar', ventas: 2000, gastos: 9800 },
    { name: 'Abr', ventas: 2780, gastos: 3908 },
    { name: 'May', ventas: 1890, gastos: 4800 },
    { name: 'Jun', ventas: 2390, gastos: 3800 },
  ]

  const barData = [
    { name: 'Lun', value: 30 },
    { name: 'Mar', value: 45 },
    { name: 'Mié', value: 60 },
    { name: 'Jue', value: 38 },
    { name: 'Vie', value: 75 },
    { name: 'Sáb', value: 90 },
    { name: 'Dom', value: 65 },
  ]

  const pieData = [
    { name: 'Producto A', value: 400, color: '#3b82f6' },
    { name: 'Producto B', value: 300, color: '#8b5cf6' },
    { name: 'Producto C', value: 200, color: '#ec4899' },
    { name: 'Producto D', value: 100, color: '#f59e0b' },
  ]

  const radarData = [
    { subject: 'UI', A: 120, fullMark: 150 },
    { subject: 'UX', A: 98, fullMark: 150 },
    { subject: 'Performance', A: 86, fullMark: 150 },
    { subject: 'Security', A: 99, fullMark: 150 },
    { subject: 'SEO', A: 85, fullMark: 150 },
  ]

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChartLine size={24} weight="duotone" />
            Line Chart
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="ventas" stroke="#3b82f6" strokeWidth={2} />
              <Line type="monotone" dataKey="gastos" stroke="#f59e0b" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconChartPie size={24} />
            Bar Chart
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconTrendingUp size={24} />
            Pie Chart
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star size={24} weight="duotone" />
            Radar Chart
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" />
              <PolarRadiusAxis />
              <Radar name="Score" dataKey="A" stroke="#ec4899" fill="#ec4899" fillOpacity={0.6} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </>
  )
}

// Animations Component
function AnimationsDemo() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Hover Scale</CardTitle>
        </CardHeader>
        <CardContent>
          <motion.div
            className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg p-8 text-white text-center cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Lightning size={48} weight="duotone" className="mx-auto" />
            <p className="mt-2">Hover me!</p>
          </motion.div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Rotate Animation</CardTitle>
        </CardHeader>
        <CardContent>
          <motion.div
            className="bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg p-8 text-white text-center cursor-pointer"
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.5 }}
          >
            <Gear size={48} weight="duotone" className="mx-auto" />
            <p className="mt-2">Hover me!</p>
          </motion.div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Drag</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4 h-40 flex items-center justify-center">
            <motion.div
              className="bg-gradient-to-br from-pink-400 to-pink-600 rounded-lg p-6 text-white cursor-grab active:cursor-grabbing"
              drag
              dragConstraints={{ left: -50, right: 50, top: -30, bottom: 30 }}
              whileDrag={{ scale: 1.1 }}
            >
              <Heart size={32} weight="duotone" />
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
