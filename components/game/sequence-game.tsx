'use client'

import { useState, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { GRID_CONFIG } from '@/lib/types'
import { Eye, Repeat, CheckCircle, XCircle, Zap, Play } from 'lucide-react'

type SequenceGameProps = {
  gridSize: number
  sequence: { row: number; col: number }[]
  userSequence: { row: number; col: number }[]
  isWatching: boolean
  onCellClick: (row: number, col: number) => void
  onWatchComplete: () => void
  className?: string
}

export function SequenceGame({
  gridSize,
  sequence,
  userSequence,
  isWatching,
  onCellClick,
  onWatchComplete,
  className,
}: SequenceGameProps) {
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const [showingSequence, setShowingSequence] = useState(false)
  const [pauseCountdown, setPauseCountdown] = useState(0)
  const [lastClickResult, setLastClickResult] = useState<'correct' | 'incorrect' | null>(null)

  const playSequence = useCallback(async () => {
    setShowingSequence(true)
    setHighlightedIndex(-1)

    for (let i = 0; i < sequence.length; i++) {
      setHighlightedIndex(i)
      await new Promise((resolve) => setTimeout(resolve, GRID_CONFIG.SEQUENCE_DISPLAY_TIME))
      setHighlightedIndex(-1)
      await new Promise((resolve) => setTimeout(resolve, 200))
    }

    setShowingSequence(false)
    setPauseCountdown(GRID_CONFIG.SEQUENCE_PAUSE)
  }, [sequence])

  useEffect(() => {
    if (pauseCountdown > 0) {
      const timer = setTimeout(() => {
        setPauseCountdown(pauseCountdown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (pauseCountdown === 0 && !showingSequence && isWatching) {
      onWatchComplete()
    }
  }, [pauseCountdown, showingSequence, isWatching, onWatchComplete])

  useEffect(() => {
    if (isWatching && sequence.length > 0) {
      playSequence()
    }
  }, [isWatching, sequence.length, playSequence])

  const handleCellClick = (row: number, col: number) => {
    if (isWatching || showingSequence) return

    const expectedIndex = userSequence.length
    const expectedCell = sequence[expectedIndex]

    if (expectedCell) {
      const isCorrect = expectedCell.row === row && expectedCell.col === col
      setLastClickResult(isCorrect ? 'correct' : 'incorrect')
      setTimeout(() => setLastClickResult(null), 400)
    }

    onCellClick(row, col)
  }

  const currentHighlight = highlightedIndex >= 0 ? sequence[highlightedIndex] : null
  const isComplete = userSequence.length === sequence.length
  const hasError = userSequence.length > 0 && userSequence.some((cell, idx) => {
    const expected = sequence[idx]
    return expected && (cell.row !== expected.row || cell.col !== expected.col)
  })

  const grid = Array.from({ length: gridSize }, (_, row) =>
    Array.from({ length: gridSize }, (_, col) => ({ row, col }))
  )

  return (
    <div className={cn('flex flex-col items-center gap-6', className)}>
      {/* Status indicator */}
      <div className={cn(
        'flex items-center gap-3 px-6 py-3 rounded-2xl glass-card',
        showingSequence && 'animate-glow-pulse'
      )}>
        {isWatching || showingSequence ? (
          <>
            <Eye className="w-5 h-5 text-warning animate-pulse" />
            <span className="font-medium">Watch the sequence...</span>
            <span className="text-sm text-muted-foreground">
              ({highlightedIndex + 1}/{sequence.length})
            </span>
          </>
        ) : pauseCountdown > 0 ? (
          <>
            <Zap className="w-5 h-5 text-warning animate-bounce-subtle" />
            <span className="font-medium">Get ready in {pauseCountdown}...</span>
          </>
        ) : (
          <>
            <Repeat className="w-5 h-5 text-warning" />
            <span className="font-medium">Your turn!</span>
            <span className="text-sm text-muted-foreground">
              ({userSequence.length}/{sequence.length})
            </span>
          </>
        )}
      </div>

      {/* Sequence grid */}
      <div className="relative">
        <div className="absolute inset-0 bg-warning/10 blur-xl rounded-3xl" />
        <div
          className={cn(
            'relative grid gap-3 p-5 md:p-6 glass-card rounded-2xl',
            gridSize === 3 && 'grid-cols-3',
            gridSize === 4 && 'grid-cols-4',
            gridSize === 5 && 'grid-cols-5'
          )}
        >
          {grid.map((row, rowIndex) =>
            row.map((cell, colIndex) => {
              const isHighlighted =
                currentHighlight?.row === rowIndex && currentHighlight?.col === colIndex
              const userIndex = userSequence.findIndex(
                (s) => s.row === rowIndex && s.col === colIndex
              )
              const wasClicked = userIndex !== -1
              const isInteractive = !isWatching && !showingSequence && pauseCountdown === 0 && !isComplete && !hasError

              return (
                <button
                  key={`${rowIndex}-${colIndex}`}
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                  disabled={!isInteractive}
                  className={cn(
                    'w-16 h-16 md:w-20 md:h-20 rounded-xl border-2 transition-all duration-200',
                    'flex items-center justify-center font-bold text-lg',
                    'bg-card/80 backdrop-blur-sm border-border/50',
                    isHighlighted && 'bg-warning border-warning text-warning-foreground scale-110 shadow-xl glow-warning',
                    wasClicked && !isHighlighted && 'bg-warning/20 border-warning/50',
                    isInteractive && 'hover:border-warning/50 hover:bg-warning/5 cursor-pointer',
                    !isInteractive && 'cursor-not-allowed opacity-60'
                  )}
                >
                  {wasClicked && (
                    <span className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
                      'bg-warning/20 text-warning'
                    )}>
                      {userIndex + 1}
                    </span>
                  )}
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* Feedback messages */}
      {lastClickResult && (
        <div
          className={cn(
            'flex items-center gap-2 px-5 py-3 rounded-xl font-medium animate-scale-in',
            lastClickResult === 'correct' && 'bg-success/20 text-success glow-success',
            lastClickResult === 'incorrect' && 'bg-destructive/20 text-destructive'
          )}
        >
          {lastClickResult === 'correct' ? (
            <>
              <CheckCircle className="w-5 h-5" />
              <span>Correct!</span>
            </>
          ) : (
            <>
              <XCircle className="w-5 h-5" />
              <span>Wrong cell!</span>
            </>
          )}
        </div>
      )}

      {isComplete && !hasError && (
        <div className="flex items-center gap-2 px-5 py-3 rounded-xl bg-success/20 text-success glow-success animate-scale-in">
          <CheckCircle className="w-5 h-5" />
          <span className="font-medium">Sequence completed perfectly!</span>
        </div>
      )}

      {hasError && (
        <div className="flex items-center gap-2 px-5 py-3 rounded-xl bg-destructive/20 text-destructive animate-shake">
          <XCircle className="w-5 h-5" />
          <span className="font-medium">Sequence broken at step {userSequence.length}</span>
        </div>
      )}

      {isWatching && !showingSequence && pauseCountdown === 0 && (
        <Button onClick={playSequence} variant="outline" className="gap-2">
          <Play className="w-4 h-4" />
          Watch Again
        </Button>
      )}
    </div>
  )
}
