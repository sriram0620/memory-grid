'use client'

import { useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { Clock, AlertTriangle } from 'lucide-react'

type TimerProps = {
  timeRemaining: number
  onTick: (newTime: number) => void
  onComplete?: () => void
  isActive?: boolean
  className?: string
}

export function Timer({
  timeRemaining,
  onTick,
  onComplete,
  isActive = true,
  className,
}: TimerProps) {
  const tick = useCallback(() => {
    if (timeRemaining > 0) {
      onTick(timeRemaining - 1)
    } else if (onComplete) {
      onComplete()
    }
  }, [timeRemaining, onTick, onComplete])

  useEffect(() => {
    if (!isActive || timeRemaining <= 0) return

    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [isActive, timeRemaining, tick])

  const minutes = Math.floor(timeRemaining / 60)
  const seconds = timeRemaining % 60
  const isLow = timeRemaining <= 10 && timeRemaining > 0
  const isCritical = timeRemaining <= 5 && timeRemaining > 0

  // Calculate progress percentage (assuming max is 60 seconds for most phases)
  const maxTime = 60
  const progress = Math.min((timeRemaining / maxTime) * 100, 100)

  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      <div
        className={cn(
          'relative flex items-center gap-3 px-6 py-3 rounded-2xl font-mono text-2xl font-bold transition-all',
          'glass-card',
          isLow && !isCritical && 'border-warning/50 bg-warning/10',
          isCritical && 'border-destructive/50 bg-destructive/10 animate-shake'
        )}
      >
        {/* Progress bar background */}
        <div className="absolute inset-0 rounded-2xl overflow-hidden">
          <div 
            className={cn(
              'absolute left-0 top-0 h-full transition-all duration-1000 ease-linear',
              isCritical ? 'bg-destructive/20' : isLow ? 'bg-warning/20' : 'bg-primary/10'
            )}
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Icon */}
        <div className="relative">
          {isCritical ? (
            <AlertTriangle className={cn('w-6 h-6 text-destructive', isCritical && 'animate-pulse')} />
          ) : (
            <Clock className={cn('w-6 h-6', isLow ? 'text-warning' : 'text-primary')} />
          )}
        </div>

        {/* Time display */}
        <span className={cn(
          'relative',
          isCritical ? 'text-destructive' : isLow ? 'text-warning' : 'gradient-text'
        )}>
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </span>
      </div>

      {/* Warning text */}
      {isLow && (
        <span className={cn(
          'text-xs font-medium animate-neon-flicker',
          isCritical ? 'text-destructive' : 'text-warning'
        )}>
          {isCritical ? 'Hurry up!' : 'Time running low!'}
        </span>
      )}
    </div>
  )
}
