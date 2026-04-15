'use client'

import { useEffect, useState, useRef } from 'react'
import { GameScore, GameTelemetry, GridCell, GameMode } from '@/lib/types'
import { saveGameSession } from '@/lib/services/api'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  Trophy,
  Target,
  Clock,
  Zap,
  Grid3X3,
  HelpCircle,
  Repeat,
  RotateCcw,
  Share2,
  Check,
  X,
  Loader2,
  Medal,
  Star,
  Sparkles,
  Home,
  ArrowRight,
} from 'lucide-react'
import Link from 'next/link'
import confetti from 'canvas-confetti'

type ResultsScreenProps = {
  score: GameScore
  telemetry: GameTelemetry
  playerName: string
  gridSize: number
  gameMode: GameMode
  originalGrid: GridCell[][]
  reconstructedGrid: GridCell[][]
  userSequence: { row: number; col: number }[]
  onPlayAgain: () => void
  className?: string
}

export function ResultsScreen({
  score,
  telemetry,
  playerName,
  gridSize,
  gameMode,
  originalGrid,
  reconstructedGrid,
  userSequence,
  onPlayAgain,
  className,
}: ResultsScreenProps) {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [showScore, setShowScore] = useState(false)

  const totalTime = telemetry.endTime
    ? Math.round((telemetry.endTime - telemetry.startTime) / 1000)
    : 0

  const correctActions = telemetry.actions.filter((a) => a.correct).length
  const incorrectActions = telemetry.actions.filter((a) => !a.correct).length

  // Animate score reveal and confetti
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowScore(true)
      
      // Trigger confetti for good scores
      if (score.accuracy >= 70) {
        confetti({
          particleCount: score.accuracy >= 90 ? 150 : 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899'],
        })
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [score.accuracy])

  const saveInitiated = useRef(false)

  // Save result to database
  useEffect(() => {
    if (saveInitiated.current) return
    
    const saveResult = async () => {
      saveInitiated.current = true
      setSaving(true)
      setSaveError(null)
      
      const result = await saveGameSession({
        playerName,
        gridSize,
        gameMode,
        telemetry,
        score,
        originalGrid,
        reconstructedGrid,
        userSequence,
      })
      
      if (result.success) {
        setSaved(true)
      } else {
        setSaveError(result.error || 'Failed to save')
        // We don't reset saveInitiated.current here because we don't want 
        // accidental retries on every re-render. User can retry by other means if we added a button.
      }
      
      setSaving(false)
    }

    saveResult()
  }, [playerName, gridSize, gameMode, telemetry, score, originalGrid, reconstructedGrid, userSequence])

  const getGrade = () => {
    if (score.accuracy >= 90) return { grade: 'S', label: 'Legendary!', color: 'text-warning', bgColor: 'bg-warning/20', borderColor: 'border-warning' }
    if (score.accuracy >= 80) return { grade: 'A', label: 'Excellent!', color: 'text-success', bgColor: 'bg-success/20', borderColor: 'border-success' }
    if (score.accuracy >= 70) return { grade: 'B', label: 'Great!', color: 'text-primary', bgColor: 'bg-primary/20', borderColor: 'border-primary' }
    if (score.accuracy >= 60) return { grade: 'C', label: 'Good', color: 'text-accent', bgColor: 'bg-accent/20', borderColor: 'border-accent' }
    return { grade: 'D', label: 'Keep Practicing', color: 'text-muted-foreground', bgColor: 'bg-muted', borderColor: 'border-muted' }
  }

  const gradeInfo = getGrade()

  return (
    <div className={cn('min-h-screen bg-background bg-grid-pattern relative overflow-hidden', className)}>
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-float delay-500" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between p-6 max-w-7xl mx-auto">
        <Link href="/play" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <Home className="w-5 h-5" />
          <span className="text-sm">Back to Game</span>
        </Link>
        <Link href="/leaderboard">
          <Button variant="outline" size="sm" className="gap-2">
            <Medal className="w-4 h-4" />
            Leaderboard
          </Button>
        </Link>
      </nav>

      <main className="relative z-10 max-w-4xl mx-auto px-6 pb-16">
        {/* Hero Score Section */}
        <div className={cn(
          'text-center mb-12 transition-all duration-700',
          showScore ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        )}>
          {/* Trophy */}
          <div className="relative inline-block mb-8">
            <div className="absolute inset-0 bg-warning/20 rounded-full animate-pulse-ring" />
            <div className="relative glass-card rounded-full p-6 animate-glow-pulse">
              <Trophy className="w-16 h-16 text-warning" />
            </div>
            {score.accuracy >= 90 && (
              <div className="absolute -top-2 -right-2">
                <Star className="w-8 h-8 text-warning fill-warning animate-bounce-subtle" />
              </div>
            )}
          </div>

          <h1 className="text-3xl font-bold mb-2">{gradeInfo.label}</h1>
          
          {/* Grade Badge */}
          <div className={cn(
            'inline-flex items-center gap-2 px-6 py-2 rounded-full mb-6',
            gradeInfo.bgColor, 'border-2', gradeInfo.borderColor
          )}>
            <span className={cn('text-4xl font-bold', gradeInfo.color)}>{gradeInfo.grade}</span>
            <span className={cn('text-lg font-medium', gradeInfo.color)}>Rank</span>
          </div>

          {/* Main Score */}
          <div className="glass-card rounded-3xl p-8 max-w-md mx-auto">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="w-6 h-6 text-primary" />
              <span className="text-sm text-muted-foreground uppercase tracking-wide">Total Score</span>
            </div>
            <div className="text-7xl font-bold gradient-text-animated mb-4">
              {score.totalScore}
            </div>
            <div className="flex items-center justify-center gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-foreground">{score.accuracy}%</div>
                <p className="text-xs text-muted-foreground">Accuracy</p>
              </div>
              <div className="w-px h-10 bg-border" />
              <div className="text-center">
                <div className="text-3xl font-bold text-success">+{score.speedBonus}</div>
                <p className="text-xs text-muted-foreground">Speed Bonus</p>
              </div>
            </div>
          </div>
        </div>

        {/* Breakdown Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {[
            {
              icon: Grid3X3,
              title: 'Reconstruction',
              correct: score.breakdown.correctPlacements,
              total: score.breakdown.totalPlacements,
              points: score.reconstructionScore,
              color: 'text-primary',
              bg: 'bg-primary/10',
            },
            {
              icon: HelpCircle,
              title: 'Quiz',
              correct: score.breakdown.correctQuizAnswers,
              total: score.breakdown.totalQuizQuestions,
              points: score.quizScore,
              color: 'text-success',
              bg: 'bg-success/10',
            },
            {
              icon: Repeat,
              title: 'Sequence',
              correct: score.breakdown.correctSequenceSteps,
              total: score.breakdown.totalSequenceSteps,
              points: score.sequenceScore,
              color: 'text-warning',
              bg: 'bg-warning/10',
            },
          ].map((item, i) => (
            <div 
              key={item.title}
              className={cn(
                'glass-card rounded-2xl p-5 hover-lift opacity-0 animate-slide-up',
              )}
              style={{ animationDelay: `${(i + 3) * 100}ms`, animationFillMode: 'forwards' }}
            >
              <div className={cn('p-2 rounded-xl w-fit mb-3', item.bg)}>
                <item.icon className={cn('w-5 h-5', item.color)} />
              </div>
              <h3 className="font-semibold text-sm text-muted-foreground mb-1">{item.title}</h3>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold">{item.correct}/{item.total}</span>
                <span className={cn('text-lg font-semibold', item.color)}>+{item.points}</span>
              </div>
              {/* Progress bar */}
              <div className="mt-3 h-1.5 bg-muted rounded-full overflow-hidden">
                <div 
                  className={cn('h-full rounded-full transition-all duration-1000', item.bg.replace('/10', ''))}
                  style={{ width: `${item.total > 0 ? (item.correct / item.total) * 100 : 0}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Stats Grid */}
        <div className="glass-card rounded-2xl p-6 mb-8 opacity-0 animate-slide-up" style={{ animationDelay: '600ms', animationFillMode: 'forwards' }}>
          <h3 className="font-semibold flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-primary" />
            Performance Stats
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Clock, label: 'Total Time', value: `${totalTime}s`, color: 'text-muted-foreground' },
              { icon: Zap, label: 'Speed Bonus', value: `+${score.speedBonus}`, color: 'text-success' },
              { icon: Check, label: 'Correct', value: correctActions, color: 'text-success' },
              { icon: X, label: 'Incorrect', value: incorrectActions, color: 'text-destructive' },
            ].map((stat) => (
              <div key={stat.label} className="text-center p-4 rounded-xl bg-secondary/30">
                <stat.icon className={cn('w-5 h-5 mx-auto mb-2', stat.color)} />
                <div className={cn('text-xl font-bold', stat.color === 'text-muted-foreground' ? 'text-foreground' : stat.color)}>
                  {stat.value}
                </div>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center opacity-0 animate-slide-up" style={{ animationDelay: '700ms', animationFillMode: 'forwards' }}>
          <Button 
            onClick={onPlayAgain} 
            size="lg" 
            className="h-14 px-8 text-lg font-semibold bg-primary hover:bg-primary/90 glow-primary group"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Play Again
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Link href="/leaderboard">
            <Button variant="outline" size="lg" className="h-14 px-8 text-lg border-border/50 hover:border-primary/50 w-full sm:w-auto">
              <Medal className="w-5 h-5 mr-2 text-warning" />
              View Leaderboard
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="lg"
            className="h-14 px-6"
            onClick={() => {
              const text = `I scored ${score.totalScore} points with ${score.accuracy}% accuracy in Memory Grid Challenge! 🧠🎮`
              if (navigator.share) {
                navigator.share({ title: 'Memory Grid Challenge', text })
              } else {
                navigator.clipboard.writeText(text)
              }
            }}
          >
            <Share2 className="w-5 h-5 mr-2" />
            Share
          </Button>
        </div>

        {/* Save Status */}
        <div className="text-center mt-6">
          {saving && (
            <span className="inline-flex items-center gap-2 text-sm text-muted-foreground px-4 py-2 rounded-full glass">
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving to leaderboard...
            </span>
          )}
          {saved && (
            <span className="inline-flex items-center gap-2 text-sm text-success px-4 py-2 rounded-full bg-success/10">
              <Check className="w-4 h-4" />
              Saved to leaderboard!
            </span>
          )}
          {saveError && (
            <span className="inline-flex items-center gap-2 text-sm text-destructive px-4 py-2 rounded-full bg-destructive/10">
              <X className="w-4 h-4" />
              {saveError}
            </span>
          )}
        </div>
      </main>
    </div>
  )
}
