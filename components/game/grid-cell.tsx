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
  X,
} from 'lucide-react'

type GridCellProps = {
  content: CellContent | null
  isHighlighted?: boolean
  isDropTarget?: boolean
  onClick?: () => void
  onDrop?: (element: CellContent) => void
  onRemove?: () => void
  interactive?: boolean
  showPosition?: boolean
  row?: number
  col?: number
  size?: 'sm' | 'md' | 'lg'
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

export function GridCell({
  content,
  isHighlighted = false,
  isDropTarget = false,
  onClick,
  onDrop,
  onRemove,
  interactive = false,
  showPosition = false,
  row,
  col,
  size = 'md',
}: GridCellProps) {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16 md:w-20 md:h-20',
    lg: 'w-20 h-20 md:w-24 md:h-24',
  }

  const handleDragOver = (e: React.DragEvent) => {
    if (interactive) {
      e.preventDefault()
      e.dataTransfer.dropEffect = 'move'
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    if (interactive && onDrop) {
      e.preventDefault()
      const elementData = e.dataTransfer.getData('application/json')
      if (elementData) {
        const element = JSON.parse(elementData) as CellContent
        onDrop(element)
      }
    }
  }

  const handleClick = () => {
    if (onClick) {
      onClick()
    } else if (interactive && content && onRemove) {
      onRemove()
    }
  }

  const renderContent = () => {
    if (!content) {
      return (
        <span className="text-muted-foreground/30 text-xs font-mono">
          {showPosition && row !== undefined && col !== undefined
            ? `${row + 1},${col + 1}`
            : ''}
        </span>
      )
    }

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
          <span className="text-2xl md:text-3xl font-bold text-foreground">
            {content.value}
          </span>
        )
      case 'icon': {
        const IconComponent = iconMap[content.value]
        return IconComponent ? (
          <IconComponent className="w-8 h-8 md:w-10 md:h-10 text-foreground" />
        ) : (
          <span className="text-foreground">{content.value}</span>
        )
      }
      default:
        return null
    }
  }

  return (
    <div
      className={cn(
        sizeClasses[size],
        'group relative flex items-center justify-center rounded-xl border-2 transition-all duration-200',
        'bg-card/80 backdrop-blur-sm',
        content ? 'border-border/50 shadow-md' : 'border-dashed border-muted-foreground/20',
        isHighlighted && 'ring-4 ring-primary/50 animate-pulse border-primary glow-primary',
        isDropTarget && 'border-primary bg-primary/10 scale-105',
        interactive && !content && 'cursor-pointer hover:border-primary/50 hover:bg-primary/5',
        interactive && content && 'cursor-pointer hover:border-destructive/50 hover:bg-destructive/5'
      )}
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onKeyDown={(e) => {
        if (interactive && (e.key === 'Enter' || e.key === ' ')) {
          handleClick()
        }
      }}
    >
      {renderContent()}
      
      {/* Remove indicator for interactive cells with content */}
      {interactive && content && (
        <div className="absolute inset-0 flex items-center justify-center bg-destructive/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-8 h-8 rounded-full bg-destructive flex items-center justify-center shadow-lg">
            <X className="w-4 h-4 text-destructive-foreground" />
          </div>
        </div>
      )}

      {/* Drop zone indicator */}
      {interactive && !content && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <div className="w-8 h-8 rounded-full border-2 border-dashed border-primary/50" />
        </div>
      )}
    </div>
  )
}
