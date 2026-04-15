'use client'

import { GamePhase } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Eye, EyeOff, Puzzle, HelpCircle, Repeat, Trophy, Zap, CheckCircle } from 'lucide-react'

type PhaseIndicatorProps = {
  currentPhase: GamePhase
  className?: string
}

const phases = [
  { id: 'observation', label: 'Observe', icon: Eye, color: 'text-primary' },
  { id: 'hide', label: 'Hide', icon: EyeOff, color: 'text-muted-foreground' },
  { id: 'recall_reconstruct', label: 'Reconstruct', icon: Puzzle, color: 'text-accent' },
  { id: 'recall_quiz', label: 'Quiz', icon: HelpCircle, color: 'text-success' },
  { id: 'sequence_watch', label: 'Watch', icon: Zap, color: 'text-warning' },
  { id: 'sequence_replay', label: 'Replay', icon: Repeat, color: 'text-warning' },
  { id: 'results', label: 'Results', icon: Trophy, color: 'text-warning' },
]

const phaseOrder: GamePhase[] = [
  'observation',
  'hide',
  'recall_reconstruct',
  'recall_quiz',
  'sequence_watch',
  'sequence_replay',
  'results',
]

export function PhaseIndicator({ currentPhase, className }: PhaseIndicatorProps) {
  const currentIndex = phaseOrder.indexOf(currentPhase)

  // Simplified phases for display (combine watch/replay into sequence)
  const displayPhases = [
    { id: 'observation', label: 'Observe', icon: Eye },
    { id: 'recall_reconstruct', label: 'Build', icon: Puzzle },
    { id: 'recall_quiz', label: 'Quiz', icon: HelpCircle },
    { id: 'sequence_watch', label: 'Sequence', icon: Zap },
  ]

  const getDisplayPhaseIndex = (phase: GamePhase) => {
    if (phase === 'observation' || phase === 'hide') return 0
    if (phase === 'recall_reconstruct') return 1
    if (phase === 'recall_quiz') return 2
    if (phase === 'sequence_countdown' || phase === 'sequence_watch' || phase === 'sequence_replay') return 3
    return 4
  }

  const currentDisplayIndex = getDisplayPhaseIndex(currentPhase)

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div className="glass rounded-full px-2 py-1.5 flex items-center gap-1">
        {displayPhases.map((phase, index) => {
          const Icon = phase.icon
          const isActive = index === currentDisplayIndex
          const isCompleted = index < currentDisplayIndex

          return (
            <div key={phase.id} className="flex items-center">
              <div
                className={cn(
                  'relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300',
                  isActive && 'bg-primary text-primary-foreground shadow-lg glow-primary',
                  isCompleted && 'bg-success/20 text-success',
                  !isActive && !isCompleted && 'text-muted-foreground'
                )}
              >
                {isCompleted ? (
                  <CheckCircle className="w-3.5 h-3.5" />
                ) : (
                  <Icon className={cn('w-3.5 h-3.5', isActive && 'animate-pulse')} />
                )}
                <span className="hidden sm:inline">{phase.label}</span>

                {/* Active pulse ring */}
                {isActive && (
                  <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse-ring" />
                )}
              </div>

              {/* Connector line */}
              {index < displayPhases.length - 1 && (
                <div className="relative w-6 h-0.5 mx-0.5 overflow-hidden">
                  <div 
                    className={cn(
                      'absolute inset-0',
                      isCompleted ? 'bg-success' : 'bg-muted'
                    )}
                  />
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-primary to-transparent animate-shimmer" />
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
