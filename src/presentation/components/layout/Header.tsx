/**
 * Header Component
 *
 * Header fijo superior con:
 * - Avatar del usuario (izquierda)
 * - Logo WAPP (centro)
 * - Menú hamburguesa (derecha)
 */

import { Menu } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

interface HeaderProps {
  userName?: string | null
  userImage?: string | null
}

export function Header({ userName, userImage }: HeaderProps) {
  const initials = userName
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '??'

  return (
    <div className="h-full flex items-center justify-between px-4 border-b bg-card">
      {/* Avatar usuario */}
      <Button variant="ghost" size="icon" className="rounded-full">
        <Avatar className="h-8 w-8">
          <AvatarImage src={userImage || undefined} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      </Button>

      {/* Logo WAPP */}
      <h1 className="text-xl font-bold tracking-tight text-foreground">
        WAPP
      </h1>

      {/* Menú hamburguesa */}
      <Button variant="ghost" size="icon">
        <Menu className="h-5 w-5" />
      </Button>
    </div>
  )
}
