'use client'

import { useState } from 'react'
import { useGame } from '@/lib/game-context'
import { GameMode } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { cn } from '@/lib/utils'
import { 
  Brain, Grid3X3, Play, Zap, Trophy, Clock, Target, Medal, 
  User, LogOut, ArrowRight, Sparkles, Home
} from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type SetupScreenProps = {
  userEmail?: string
}

export function SetupScreen({ userEmail }: SetupScreenProps) {
  const { state, dispatch, startGame } = useGame()
  const [gridSize, setGridSize] = useState<3 | 4>(4)
  const [gameMode] = useState<GameMode>('full_challenge')
  const router = useRouter()

  const handleStart = () => {
    startGame(gameMode, gridSize, state.playerName || 'Anonymous')
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 relative z-10">
      {/* Header with user info */}
      <div className="flex items-center justify-between mb-8">
        <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <Home className="w-5 h-5" />
          <span className="text-sm">Home</span>
        </Link>
        
        <div className="flex items-center gap-4">
          {userEmail && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="w-4 h-4" />
              <span>{userEmail}</span>
            </div>
          )}
          <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2 text-muted-foreground hover:text-foreground">
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Hero */}
      <div className="text-center mb-12 animate-slide-down">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl glass-card animate-glow-pulse mb-6">
          <Brain className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
          <span className="gradient-text">Memory Grid Challenge</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-lg mx-auto">
          Test your cognitive abilities through observation, reconstruction, quizzes, and pattern matching
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Column - How it Works */}
        <div className="space-y-6">
          <div className="glass-card rounded-2xl p-6 hover-lift">
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-6">
              <Target className="w-5 h-5 text-primary" />
              Game Phases
            </h2>
            <div className="space-y-4">
              {[
                { num: '01', title: 'Observe', desc: 'Memorize the grid pattern', time: '8 seconds', icon: Clock },
                { num: '02', title: 'Reconstruct', desc: 'Rebuild from memory', time: '60 seconds', icon: Grid3X3 },
                { num: '03', title: 'Quiz', desc: 'Answer questions', time: '30 seconds', icon: Target },
                { num: '04', title: 'Sequence', desc: 'Repeat the pattern', time: '45 seconds', icon: Zap },
              ].map((phase, i) => (
                <div 
                  key={phase.num}
                  className="flex items-start gap-4 p-4 rounded-xl bg-secondary/30 opacity-0 animate-slide-up"
                  style={{ animationDelay: `${(i + 1) * 100}ms`, animationFillMode: 'forwards' }}
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <span className="text-lg font-bold gradient-text">{phase.num}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{phase.title}</h3>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <phase.icon className="w-3 h-3" />
                        {phase.time}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{phase.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Scoring */}
          <div className="glass-card rounded-2xl p-6 hover-lift opacity-0 animate-slide-up" style={{ animationDelay: '500ms', animationFillMode: 'forwards' }}>
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <Trophy className="w-5 h-5 text-warning" />
              Scoring System
            </h2>
            <div className="space-y-3">
              {[
                { points: '+10', desc: 'Correct grid placement', color: 'text-primary' },
                { points: '+15', desc: 'Correct quiz answer', color: 'text-accent' },
                { points: '+20', desc: 'Correct sequence step', color: 'text-success' },
                { points: '+25%', desc: 'Speed bonus for fast completion', color: 'text-warning', icon: Zap },
              ].map((score, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className={`font-mono font-bold ${score.color}`}>{score.points}</span>
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    {score.icon && <score.icon className="w-3 h-3" />}
                    {score.desc}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Game Setup */}
        <div className="glass-card rounded-2xl p-8 hover-lift opacity-0 animate-scale-in" style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}>
          <h2 className="text-xl font-semibold flex items-center gap-2 mb-8">
            <Sparkles className="w-5 h-5 text-accent" />
            Configure Your Game
          </h2>

          <div className="space-y-8">
            {/* Player name */}
            <div className="space-y-3">
              <Label htmlFor="playerName" className="text-base flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                Display Name
              </Label>
              <Input
                id="playerName"
                value={state.playerName}
                onChange={(e) => dispatch({ type: 'SET_PLAYER_NAME', payload: e.target.value })}
                placeholder="Enter your gamer tag..."
                className="h-12 bg-secondary/50 border-border/50 focus:border-primary focus:ring-primary/20"
              />
            </div>

            {/* Grid size */}
            <div className="space-y-3">
              <Label className="text-base">Difficulty Level</Label>
              <RadioGroup
                value={gridSize.toString()}
                onValueChange={(v) => setGridSize(parseInt(v) as 3 | 4)}
                className="grid grid-cols-2 gap-4"
              >
                <div
                  className={cn(
                    'relative border-2 rounded-xl p-5 cursor-pointer transition-all',
                    gridSize === 3 
                      ? 'border-primary bg-primary/10 glow-primary' 
                      : 'border-border/50 hover:border-primary/50 hover:bg-secondary/30'
                  )}
                  onClick={() => setGridSize(3)}
                >
                  <RadioGroupItem value="3" id="grid-3" className="sr-only" />
                  <Label htmlFor="grid-3" className="cursor-pointer">
                    <div className="flex flex-col items-center text-center gap-3">
                      <div className="grid grid-cols-3 gap-1">
                        {Array(9).fill(0).map((_, i) => (
                          <div key={i} className="w-4 h-4 rounded bg-primary/30" />
                        ))}
                      </div>
                      <div>
                        <p className="font-semibold">3 x 3 Grid</p>
                        <p className="text-xs text-muted-foreground">Beginner</p>
                      </div>
                    </div>
                  </Label>
                </div>

                <div
                  className={cn(
                    'relative border-2 rounded-xl p-5 cursor-pointer transition-all',
                    gridSize === 4 
                      ? 'border-accent bg-accent/10 glow-accent' 
                      : 'border-border/50 hover:border-accent/50 hover:bg-secondary/30'
                  )}
                  onClick={() => setGridSize(4)}
                >
                  <RadioGroupItem value="4" id="grid-4" className="sr-only" />
                  <Label htmlFor="grid-4" className="cursor-pointer">
                    <div className="flex flex-col items-center text-center gap-3">
                      <div className="grid grid-cols-4 gap-1">
                        {Array(16).fill(0).map((_, i) => (
                          <div key={i} className="w-3 h-3 rounded bg-accent/30" />
                        ))}
                      </div>
                      <div>
                        <p className="font-semibold">4 x 4 Grid</p>
                        <p className="text-xs text-muted-foreground">Advanced</p>
                      </div>
                    </div>
                  </Label>
                  {gridSize === 4 && (
                    <span className="absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full bg-accent/20 text-accent font-medium">
                      Popular
                    </span>
                  )}
                </div>
              </RadioGroup>
            </div>

            {/* Start button */}
            <Button 
              onClick={handleStart} 
              size="lg" 
              className="w-full h-14 text-lg font-semibold bg-primary hover:bg-primary/90 glow-primary group"
            >
              <Play className="w-5 h-5 mr-2" />
              Start Challenge
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>

            {/* Leaderboard link */}
            <div className="text-center pt-4">
              <Link 
                href="/leaderboard" 
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <Medal className="w-4 h-4" />
                View Global Leaderboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
