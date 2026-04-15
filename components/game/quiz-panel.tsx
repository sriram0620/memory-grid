'use client'

import { useState } from 'react'
import { QuizQuestion } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight, Check, HelpCircle, ArrowRight } from 'lucide-react'

type QuizPanelProps = {
  questions: QuizQuestion[]
  answers: Record<string, string>
  onAnswer: (questionId: string, answer: string) => void
  onSubmit: () => void
  className?: string
}

export function QuizPanel({
  questions,
  answers,
  onAnswer,
  onSubmit,
  className,
}: QuizPanelProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const currentQuestion = questions[currentIndex]
  const currentAnswer = answers[currentQuestion?.id] || ''

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const answeredCount = Object.keys(answers).length
  const allAnswered = answeredCount === questions.length

  if (!currentQuestion) {
    return null
  }

  return (
    <div className={cn('glass-card rounded-2xl overflow-hidden', className)}>
      {/* Progress header */}
      <div className="px-6 py-4 border-b border-border/30 bg-secondary/20">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-success" />
            <span className="text-sm font-medium">
              Question {currentIndex + 1} of {questions.length}
            </span>
          </div>
          <span className="text-sm text-muted-foreground">
            {answeredCount}/{questions.length} answered
          </span>
        </div>
        
        {/* Progress dots */}
        <div className="flex gap-1.5">
          {questions.map((q, idx) => (
            <button
              key={q.id}
              onClick={() => setCurrentIndex(idx)}
              className={cn(
                'flex-1 h-1.5 rounded-full transition-all',
                idx === currentIndex && 'bg-success',
                idx !== currentIndex && answers[q.id] && 'bg-success/50',
                idx !== currentIndex && !answers[q.id] && 'bg-muted'
              )}
            />
          ))}
        </div>
      </div>

      {/* Question content */}
      <div className="p-6 min-h-[280px]">
        <h3 className="text-xl font-semibold text-foreground mb-6">
          {currentQuestion.question}
        </h3>

        {currentQuestion.type === 'mcq' && currentQuestion.options ? (
          <RadioGroup
            value={currentAnswer}
            onValueChange={(value) => onAnswer(currentQuestion.id, value)}
            className="space-y-3"
          >
            {currentQuestion.options.map((option, idx) => (
              <div
                key={idx}
                className={cn(
                  'flex items-center space-x-4 rounded-xl border-2 p-4 transition-all cursor-pointer',
                  currentAnswer === option
                    ? 'border-success bg-success/10 glow-success'
                    : 'border-border/50 hover:border-success/50 hover:bg-secondary/30'
                )}
                onClick={() => onAnswer(currentQuestion.id, option)}
              >
                <RadioGroupItem value={option} id={`option-${idx}`} />
                <Label
                  htmlFor={`option-${idx}`}
                  className="flex-1 cursor-pointer font-medium text-base"
                >
                  {option}
                </Label>
                {currentAnswer === option && (
                  <Check className="w-5 h-5 text-success" />
                )}
              </div>
            ))}
          </RadioGroup>
        ) : (
          <div className="space-y-3">
            <Label htmlFor="text-answer" className="text-sm text-muted-foreground">
              Enter your answer
            </Label>
            <Input
              id="text-answer"
              type="text"
              value={currentAnswer}
              onChange={(e) => onAnswer(currentQuestion.id, e.target.value)}
              placeholder="Type your answer..."
              className="h-12 text-lg bg-secondary/50 border-border/50 focus:border-success focus:ring-success/20"
            />
          </div>
        )}
      </div>

      {/* Navigation footer */}
      <div className="flex items-center justify-between p-6 pt-0">
        <Button
          variant="ghost"
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className="gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>

        {currentIndex === questions.length - 1 ? (
          <Button 
            onClick={onSubmit} 
            disabled={!allAnswered}
            className="gap-2 bg-success hover:bg-success/90 text-success-foreground glow-success group"
          >
            <Check className="w-4 h-4" />
            Submit Quiz
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        ) : (
          <Button onClick={handleNext} className="gap-2 group">
            Next
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        )}
      </div>
    </div>
  )
}
