'use client'

import { CellContent } from '@/lib/types'
import { cn } from '@/lib/utils'
import {
  Star,
  Heart,
  Moon,
  Sun,
  Cloud,
  Zap,
  Flame,
  Leaf,
  Diamond,
  GripVertical,
  CheckCircle,
  Package,
} from 'lucide-react'

type ElementTrayProps = {
  elements: CellContent[]
  className?: string
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  star: Star,
  heart: Heart,
  moon: Moon,
  sun: Sun,
  cloud: Cloud,
  bolt: Zap,
  fire: Flame,
  leaf: Leaf,
  diamond: Diamond,
}

export function ElementTray({ elements, className }: ElementTrayProps) {
  const handleDragStart = (e: React.DragEvent, element: CellContent) => {
    e.dataTransfer.setData('application/json', JSON.stringify(element))
    e.dataTransfer.effectAllowed = 'move'
  }

  const renderElementContent = (content: CellContent) => {
    switch (content.type) {
      case 'color':
        return (
          <div
            className="w-full h-full rounded-lg shadow-inner"
            style={{ backgroundColor: content.value }}
          />
        )
      case 'number':
        return (
          <span className="text-xl font-bold text-foreground">
            {content.value}
          </span>
        )
      case 'icon': {
        const IconComponent = iconMap[content.value]
        return IconComponent ? (
          <IconComponent className="w-6 h-6 text-foreground" />
        ) : (
          <span className="text-foreground">{content.value}</span>
        )
      }
      default:
        return null
    }
  }

  if (elements.length === 0) {
    return (
      <div className={cn('glass-card rounded-2xl p-6 text-center', className)}>
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-success/20 mb-3">
          <CheckCircle className="w-6 h-6 text-success" />
        </div>
        <p className="text-muted-foreground text-sm">All elements placed!</p>
      </div>
    )
  }

  return (
    <div className={cn('glass-card rounded-2xl p-5', className)}>
      <div className="flex items-center gap-2 mb-4">
        <Package className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Element Tray</h3>
        <span className="text-sm text-muted-foreground ml-auto">
          {elements.length} remaining
        </span>
      </div>
      
      <div className="flex flex-wrap gap-3 justify-center">
        {elements.map((element) => (
          <div
            key={element.id}
            draggable
            onDragStart={(e) => handleDragStart(e, element)}
            className={cn(
              'relative w-14 h-14 flex items-center justify-center rounded-xl',
              'glass border border-border/50',
              'cursor-grab active:cursor-grabbing',
              'hover:border-primary/50 hover:shadow-lg hover:scale-105',
              'transition-all duration-200 ease-out group'
            )}
          >
            {/* Drag indicator */}
            <div className="absolute top-0.5 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
              <GripVertical className="w-3 h-3 text-muted-foreground" />
            </div>
            
            {renderElementContent(element)}
            
            {/* Hover glow */}
            <div className="absolute inset-0 rounded-xl bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          </div>
        ))}
      </div>
      
      <p className="text-xs text-muted-foreground text-center mt-4">
        Drag and drop elements to the grid
      </p>
    </div>
  )
}
