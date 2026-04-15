'use client'

import { useEffect, useCallback, useState } from 'react'
import { useGame } from '@/lib/game-context'
import { GameGrid } from './game-grid'
import { ElementTray } from './element-tray'
import { Timer } from './timer'
import { PhaseIndicator } from './phase-indicator'
import { QuizPanel } from './quiz-panel'
import { SequenceGame } from './sequence-game'
import { ResultsScreen } from './results-screen'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { 
  Play, Eye, Brain, Puzzle, ArrowRight, Home, 
  Sparkles, Target, Zap, CheckCircle, X, ClipboardCheck
} from 'lucide-react'
import Link from 'next/link'

export function GameController() {
  const {
    state,
    setPhase,
    placeElement,
    removeElement,
    answerQuiz,
    addSequenceInput,
    setTimeRemaining,
    finishGame,
    resetGame,
  } = useGame()

  const [autoProceeding, setAutoProceeding] = useState(false)

  // Reset auto-proceeding when phase changes
  useEffect(() => {
    setAutoProceeding(false)
  }, [state.phase])

  // Handle observation phase timer
  useEffect(() => {
    if (state.phase === 'observation' && state.timeRemaining === 0) {
      setPhase('hide')
    }
  }, [state.phase, state.timeRemaining, setPhase])

  // Auto-advance from hide phase after brief pause
  useEffect(() => {
    if (state.phase === 'hide') {
      const timer = setTimeout(() => {
        setPhase('recall_reconstruct')
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [state.phase, setPhase])

  // Handle timer tick
  const handleTimerTick = useCallback(
    (newTime: number) => {
      setTimeRemaining(newTime)
    },
    [setTimeRemaining]
  )

  // Handle reconstruction completion
  const handleReconstructionComplete = useCallback(() => {
    setPhase('recall_quiz')
  }, [setPhase])

  // Handle quiz submission
  const handleQuizSubmit = useCallback(() => {
    setPhase('sequence_countdown')
  }, [setPhase])

  // Handle sequence watch complete
  const handleSequenceWatchComplete = useCallback(() => {
    setPhase('sequence_replay')
  }, [setPhase])

  // Handle watch again (retry)
  const handleWatchAgain = useCallback(() => {
    setPhase('sequence_watch')
  }, [setPhase])

  // Auto-advance from sequence countdown
  useEffect(() => {
    if (state.phase === 'sequence_countdown' && state.timeRemaining === 0) {
      setPhase('sequence_watch')
    }
  }, [state.phase, state.timeRemaining, setPhase])

  // Auto-advance from reconstruction when all elements are placed
  useEffect(() => {
    if (state.phase === 'recall_reconstruct') {
      const placedElements = state.reconstructedGrid.flat().filter(cell => cell.content !== null)
      if (placedElements.length === state.originalGrid.flat().length) {
        setAutoProceeding(true)
        const timer = setTimeout(() => {
          handleReconstructionComplete()
        }, 1500)
        return () => clearTimeout(timer)
      }
    }
  }, [state.phase, state.reconstructedGrid, state.originalGrid, handleReconstructionComplete])

  // Auto-advance from quiz when all questions are answered
  useEffect(() => {
    if (state.phase === 'recall_quiz') {
      if (Object.keys(state.quizAnswers).length === state.quizQuestions.length) {
        setAutoProceeding(true)
        const timer = setTimeout(() => {
          handleQuizSubmit()
        }, 1500)
        return () => clearTimeout(timer)
      }
    }
  }, [state.phase, state.quizAnswers, state.quizQuestions, handleQuizSubmit])

  // Handle sequence cell click
  const handleSequenceCellClick = (row: number, col: number) => {
    addSequenceInput(row, col)

    const newLength = state.userSequence.length + 1
    if (newLength >= state.sequence.length) {
      setTimeout(() => {
        finishGame()
      }, 1000)
    }
  }

  // Render based on current phase
  const renderPhaseContent = () => {
    switch (state.phase) {
      case 'setup':
        return null

      case 'observation':
        return (
          <div className="flex flex-col items-center gap-8 animate-scale-in">
            {/* Phase Card */}
            <div className="glass-card rounded-2xl p-6 text-center max-w-md animate-glow-pulse">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/20 mb-4">
                <Eye className="w-7 h-7 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-2 gradient-text">Observation Phase</h2>
              <p className="text-muted-foreground">
                Memorize the grid! Study the colors, numbers, and positions carefully.
              </p>
            </div>

            <Timer
              timeRemaining={state.timeRemaining}
              onTick={handleTimerTick}
              isActive={true}
            />

            <div className="animate-scale-in" style={{ animationDelay: '200ms' }}>
              <GameGrid grid={state.originalGrid} />
            </div>
          </div>
        )

      case 'hide':
        return (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8 animate-scale-in">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full animate-pulse-ring" />
              <div className="relative glass-card rounded-full p-8">
                <Brain className="w-16 h-16 text-primary animate-bounce-subtle" />
              </div>
            </div>
            <div className="text-center space-y-3">
              <h2 className="text-3xl font-bold gradient-text">Grid Hidden!</h2>
              <p className="text-xl text-muted-foreground animate-neon-flicker">
                Recall what you saw...
              </p>
            </div>
          </div>
        )

      case 'recall_reconstruct':
        return (
          <div className="flex flex-col items-center gap-8 animate-slide-up">
            {/* Phase Card */}
            <div className="glass-card rounded-2xl p-6 text-center max-w-md">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-accent/20 mb-4">
                <Puzzle className="w-7 h-7 text-accent" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Reconstruct the Grid</h2>
              <p className="text-muted-foreground">
                Drag elements from the tray to their correct positions. Click placed elements to remove.
              </p>
            </div>

            <Timer
              timeRemaining={state.timeRemaining}
              onTick={handleTimerTick}
              onComplete={handleReconstructionComplete}
              isActive={true}
            />

            <div className="flex flex-col xl:flex-row items-start justify-center gap-8 w-full">
              <div className="order-2 xl:order-1">
                <ElementTray elements={state.availableElements} />
              </div>
              
              <div className="order-1 xl:order-2">
                <GameGrid
                  grid={state.reconstructedGrid}
                  interactive={true}
                  onCellDrop={placeElement}
                  onCellRemove={removeElement}
                  showPositions={true}
                />
              </div>
            </div>

            <Button 
              onClick={handleReconstructionComplete} 
              size="lg" 
              className="h-12 px-8 text-base font-semibold bg-accent hover:bg-accent/90 glow-accent group"
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              Continue to Quiz
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        )

      case 'recall_quiz':
        return (
          <div className="flex flex-col items-center gap-8 w-full max-w-2xl mx-auto animate-slide-up">
            {/* Phase Card */}
            <div className="glass-card rounded-2xl p-6 text-center w-full">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-success/20 mb-4">
                <Target className="w-7 h-7 text-success" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Memory Quiz</h2>
              <p className="text-muted-foreground">
                Answer questions about what you observed in the grid
              </p>
            </div>

            <Timer
              timeRemaining={state.timeRemaining}
              onTick={handleTimerTick}
              onComplete={handleQuizSubmit}
              isActive={true}
            />

            <QuizPanel
              questions={state.quizQuestions}
              answers={state.quizAnswers}
              onAnswer={answerQuiz}
              onSubmit={handleQuizSubmit}
              className="w-full"
            />
          </div>
        )

      case 'sequence_countdown':
        return (
          <div className="flex flex-col items-center justify-center min-h-[50vh] gap-8 animate-scale-in">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-warning/20 border-2 border-warning/50 animate-glow-pulse mb-4">
                <Zap className="w-10 h-10 text-warning" />
              </div>
              <h2 className="text-4xl font-black gradient-text-animated leading-tight">Get Ready!</h2>
              <p className="text-muted-foreground font-bold uppercase tracking-[0.4em] text-xs">Sequence starts in</p>
            </div>
            
            <div className="relative">
              <svg className="w-32 h-32 -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="60"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-secondary/30"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="60"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray="377"
                  strokeDashoffset={377 - (377 * state.timeRemaining) / 5}
                  className="text-warning transition-all duration-1000 ease-linear"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-5xl font-black text-warning">
                {state.timeRemaining}
              </div>
            </div>

            <Timer
              timeRemaining={state.timeRemaining}
              onTick={handleTimerTick}
              isActive={true}
            />
          </div>
        )

      case 'sequence_watch':
      case 'sequence_replay':
        return (
          <div className="flex flex-col items-center gap-8 animate-slide-up">
            {/* Phase Card */}
            <div className="glass-card rounded-2xl p-6 text-center max-w-md w-full relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Zap className="w-12 h-12" />
              </div>
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-warning/20 mb-4">
                <Zap className="w-7 h-7 text-warning" />
              </div>
              <h2 className="text-2xl font-bold mb-2">
                {state.phase === 'sequence_watch' ? 'Watch Carefully' : 'Replay Pattern'}
              </h2>
              <p className="text-muted-foreground">
                {state.phase === 'sequence_watch'
                  ? 'Memorize the order of the highlighted cells!'
                  : 'Click the cells in the exact order shown.'}
              </p>
            </div>

            <div className="flex flex-col items-center gap-4">
              {state.phase === 'sequence_replay' && (
                <div className="flex items-center gap-4">
                  <Timer
                    timeRemaining={state.timeRemaining}
                    onTick={handleTimerTick}
                    onComplete={finishGame}
                    isActive={true}
                  />
                  
                  {state.userSequence.length === 0 && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleWatchAgain}
                      className="gap-2 border-warning/50 text-warning hover:bg-warning/10"
                    >
                      <Eye className="w-4 h-4" />
                      Watch Again
                    </Button>
                  )}
                </div>
              )}

              <SequenceGame
                gridSize={state.gridSize}
                sequence={state.sequence}
                userSequence={state.userSequence}
                isWatching={state.phase === 'sequence_watch'}
                onCellClick={handleSequenceCellClick}
                onWatchComplete={handleSequenceWatchComplete}
              />
            </div>

            {state.phase === 'sequence_replay' && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Progress:</span>
                <div className="flex gap-1">
                  {state.sequence.map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        'w-3 h-3 rounded-full transition-all',
                        i < state.userSequence.length 
                          ? 'bg-success glow-success' 
                          : 'bg-muted'
                      )}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )

      case 'results':
        return (
          <ResultsScreen
            score={state.score}
            telemetry={state.telemetry}
            playerName={state.playerName}
            gridSize={state.gridSize}
            gameMode={state.mode}
            originalGrid={state.originalGrid}
            reconstructedGrid={state.reconstructedGrid}
            userSequence={state.userSequence}
            onPlayAgain={resetGame}
          />
        )

      default:
        return null
    }
  }

  const [isFinishing, setIsFinishing] = useState(false)

  const handleFinish = useCallback(() => {
    if (isFinishing) return
    setIsFinishing(true)
    finishGame()
  }, [isFinishing, finishGame])

  const handleQuit = useCallback(() => {
    if (isFinishing) return
    resetGame()
  }, [isFinishing, resetGame])

  return (
    <div className="min-h-screen bg-background bg-grid-pattern relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/5 rounded-full blur-3xl animate-float delay-500" />
      </div>

      {/* Header */}
      {state.phase !== 'setup' && state.phase !== 'results' && (
        <header className="sticky top-0 z-20 glass-strong border-b border-border/50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Link href="/play" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                  <Home className="w-5 h-5" />
                </Link>
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <h1 className="text-lg font-bold gradient-text">
                    Memory Grid Challenge
                  </h1>
                </div>
                {state.playerName && (
                  <span className="text-sm text-muted-foreground px-3 py-1 rounded-full glass">
                    {state.playerName}
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-3">
                <PhaseIndicator currentPhase={state.phase} />
                
                <div className="h-8 w-px bg-border/50 mx-2" />
                
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleFinish}
                    disabled={isFinishing}
                    className="text-success hover:text-success hover:bg-success/10 gap-1.5 disabled:opacity-50"
                  >
                    {isFinishing ? (
                      <div className="w-4 h-4 border-2 border-success border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <ClipboardCheck className="w-4 h-4" />
                    )}
                    <span className="hidden sm:inline">Evaluate</span>
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleQuit}
                    disabled={isFinishing}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-1.5 disabled:opacity-50"
                  >
                    <X className="w-4 h-4" />
                    <span className="hidden sm:inline">Quit</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Main content */}
      <main
        className={cn(
          'relative z-10 container mx-auto px-4 py-8',
          state.phase === 'setup' && 'flex items-center justify-center min-h-screen'
        )}
      >
        {renderPhaseContent()}

        {/* Auto-proceeding Overlay */}
        {autoProceeding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/40 backdrop-blur-sm animate-in fade-in duration-500">
            <div className="glass-card rounded-[2rem] p-8 text-center shadow-2xl animate-scale-in">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-4">
                <Sparkles className="w-8 h-8 text-primary animate-spin-slow" />
              </div>
              <h2 className="text-2xl font-black gradient-text-animated mb-2">Well Done!</h2>
              <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">
                Preparing next round...
              </p>
              <div className="mt-6 h-1 w-32 bg-secondary/50 rounded-full overflow-hidden mx-auto">
                <div className="h-full bg-primary animate-progress-fast" />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
