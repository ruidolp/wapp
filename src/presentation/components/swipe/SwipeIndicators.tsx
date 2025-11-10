'use client'

interface SwipeIndicatorsProps {
  totalItems: number
  activeIndex: number
}

export function SwipeIndicators({ totalItems, activeIndex }: SwipeIndicatorsProps) {
  return (
    <div className="flex items-center justify-center gap-2 py-3">
      {Array.from({ length: totalItems }).map((_, index) => (
        <div
          key={index}
          className={`transition-all duration-300 rounded-full ${
            index === activeIndex
              ? 'w-8 h-2.5 bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))]'
              : 'w-2.5 h-2.5 bg-muted hover:bg-muted-foreground/30'
          }`}
          style={
            index === activeIndex
              ? { boxShadow: '0 2px 8px hsl(var(--primary) / 0.4)' }
              : undefined
          }
        />
      ))}
    </div>
  )
}
