/**
 * Scoring Service
 * 
 * Handles all scoring calculations for the Memory Grid Challenge game.
 * Scoring is based on accuracy and speed.
 */

import { GridCell, QuizQuestion, GameTelemetry, GameScore, SCORING_CONFIG } from '@/lib/types'

/**
 * Scoring Logic Explanation:
 * 
 * 1. RECONSTRUCTION SCORE (Base: 10 points per correct placement)
 *    - Each cell correctly placed earns 10 points
 *    - For a 4x4 grid: max 160 points, 3x3 grid: max 90 points
 * 
 * 2. QUIZ SCORE (Base: 15 points per correct answer)
 *    - 4 quiz questions total = max 60 points
 * 
 * 3. SEQUENCE SCORE (Base: 20 points per correct step)
 *    - 4x4 grid: 5 steps = max 100 points
 *    - 3x3 grid: 4 steps = max 80 points
 * 
 * 4. SPEED BONUS (Up to 25% of base score)
 *    - Completing faster than expected time earns bonus
 *    - Linear scaling based on time saved
 * 
 * 5. ACCURACY CALCULATION
 *    - (Correct Actions / Total Actions) * 100
 */

export interface ScoreBreakdown {
  reconstruction: {
    score: number
    correct: number
    total: number
    percentage: number
  }
  quiz: {
    score: number
    correct: number
    total: number
    percentage: number
  }
  sequence: {
    score: number
    correct: number
    total: number
    percentage: number
  }
  speedBonus: {
    bonus: number
    percentage: number
    timeSaved: number
  }
  total: {
    baseScore: number
    finalScore: number
    accuracy: number
  }
}

/**
 * Calculates reconstruction score
 */
function calculateReconstructionScore(
  originalGrid: GridCell[][],
  reconstructedGrid: GridCell[][]
): { score: number; correct: number; total: number } {
  let correct = 0
  const total = originalGrid.length * originalGrid[0].length

  for (let row = 0; row < originalGrid.length; row++) {
    for (let col = 0; col < originalGrid[row].length; col++) {
      const original = originalGrid[row][col].content
      const reconstructed = reconstructedGrid[row][col]?.content

      if (original && reconstructed) {
        if (original.type === reconstructed.type && original.value === reconstructed.value) {
          correct++
        }
      }
    }
  }

  return {
    score: correct * SCORING_CONFIG.PLACEMENT_POINTS,
    correct,
    total,
  }
}

/**
 * Calculates quiz score
 */
function calculateQuizScore(
  questions: QuizQuestion[],
  answers: Record<string, string>
): { score: number; correct: number; total: number } {
  let correct = 0
  const total = questions.length

  for (const question of questions) {
    const userAnswer = answers[question.id]
    if (userAnswer && normalizeAnswer(userAnswer) === normalizeAnswer(question.correctAnswer)) {
      correct++
    }
  }

  return {
    score: correct * SCORING_CONFIG.QUIZ_POINTS,
    correct,
    total,
  }
}

/**
 * Normalizes answers for comparison
 */
function normalizeAnswer(answer: string): string {
  return answer.toLowerCase().trim()
}

/**
 * Calculates sequence score
 */
function calculateSequenceScore(
  sequence: { row: number; col: number }[],
  userSequence: { row: number; col: number }[]
): { score: number; correct: number; total: number } {
  let correct = 0
  const total = sequence.length

  for (let i = 0; i < Math.min(sequence.length, userSequence.length); i++) {
    if (sequence[i].row === userSequence[i].row && sequence[i].col === userSequence[i].col) {
      correct++
    } else {
      // Stop counting at first mistake (sequence must be exact)
      break
    }
  }

  return {
    score: correct * SCORING_CONFIG.SEQUENCE_POINTS,
    correct,
    total,
  }
}

/**
 * Calculates speed bonus
 */
function calculateSpeedBonus(
  totalTimeSeconds: number,
  baseScore: number
): { bonus: number; percentage: number; timeSaved: number } {
  const expectedTime = 120 // 2 minutes expected completion time
  const timeSaved = Math.max(0, expectedTime - totalTimeSeconds)

  if (timeSaved <= 0) {
    return { bonus: 0, percentage: 0, timeSaved: 0 }
  }

  // Linear bonus: more time saved = higher bonus (up to 25%)
  const bonusPercentage = Math.min(
    timeSaved / expectedTime,
    SCORING_CONFIG.MAX_SPEED_BONUS
  )

  const bonus = Math.round(baseScore * bonusPercentage)

  return {
    bonus,
    percentage: Math.round(bonusPercentage * 100),
    timeSaved,
  }
}

/**
 * Main scoring function - calculates complete game score
 */
export function calculateGameScore(
  originalGrid: GridCell[][],
  reconstructedGrid: GridCell[][],
  quizQuestions: QuizQuestion[],
  quizAnswers: Record<string, string>,
  sequence: { row: number; col: number }[],
  userSequence: { row: number; col: number }[],
  telemetry: GameTelemetry
): GameScore {
  // Calculate individual scores
  const reconstructionResult = calculateReconstructionScore(originalGrid, reconstructedGrid)
  const quizResult = calculateQuizScore(quizQuestions, quizAnswers)
  const sequenceResult = calculateSequenceScore(sequence, userSequence)

  // Calculate base score
  const baseScore = reconstructionResult.score + quizResult.score + sequenceResult.score

  // Calculate time taken
  const totalTimeSeconds = telemetry.endTime
    ? Math.round((telemetry.endTime - telemetry.startTime) / 1000)
    : 0

  // Calculate speed bonus
  const speedBonusResult = calculateSpeedBonus(totalTimeSeconds, baseScore)

  // Calculate overall accuracy
  const totalCorrect = reconstructionResult.correct + quizResult.correct + sequenceResult.correct
  const totalAttempts = reconstructionResult.total + quizResult.total + sequenceResult.total
  const accuracy = totalAttempts > 0 ? (totalCorrect / totalAttempts) * 100 : 0

  return {
    reconstructionScore: reconstructionResult.score,
    quizScore: quizResult.score,
    sequenceScore: sequenceResult.score,
    totalScore: baseScore + speedBonusResult.bonus,
    accuracy: Math.round(accuracy * 100) / 100,
    speedBonus: speedBonusResult.bonus,
    breakdown: {
      correctPlacements: reconstructionResult.correct,
      totalPlacements: reconstructionResult.total,
      correctQuizAnswers: quizResult.correct,
      totalQuizQuestions: quizResult.total,
      correctSequenceSteps: sequenceResult.correct,
      totalSequenceSteps: sequenceResult.total,
    },
  }
}

/**
 * Gets detailed score breakdown for display
 */
export function getDetailedBreakdown(
  originalGrid: GridCell[][],
  reconstructedGrid: GridCell[][],
  quizQuestions: QuizQuestion[],
  quizAnswers: Record<string, string>,
  sequence: { row: number; col: number }[],
  userSequence: { row: number; col: number }[],
  telemetry: GameTelemetry
): ScoreBreakdown {
  const reconstructionResult = calculateReconstructionScore(originalGrid, reconstructedGrid)
  const quizResult = calculateQuizScore(quizQuestions, quizAnswers)
  const sequenceResult = calculateSequenceScore(sequence, userSequence)
  
  const baseScore = reconstructionResult.score + quizResult.score + sequenceResult.score
  
  const totalTimeSeconds = telemetry.endTime
    ? Math.round((telemetry.endTime - telemetry.startTime) / 1000)
    : 0
    
  const speedBonusResult = calculateSpeedBonus(totalTimeSeconds, baseScore)
  
  const totalCorrect = reconstructionResult.correct + quizResult.correct + sequenceResult.correct
  const totalAttempts = reconstructionResult.total + quizResult.total + sequenceResult.total
  const accuracy = totalAttempts > 0 ? (totalCorrect / totalAttempts) * 100 : 0

  return {
    reconstruction: {
      score: reconstructionResult.score,
      correct: reconstructionResult.correct,
      total: reconstructionResult.total,
      percentage: reconstructionResult.total > 0 
        ? Math.round((reconstructionResult.correct / reconstructionResult.total) * 100) 
        : 0,
    },
    quiz: {
      score: quizResult.score,
      correct: quizResult.correct,
      total: quizResult.total,
      percentage: quizResult.total > 0 
        ? Math.round((quizResult.correct / quizResult.total) * 100) 
        : 0,
    },
    sequence: {
      score: sequenceResult.score,
      correct: sequenceResult.correct,
      total: sequenceResult.total,
      percentage: sequenceResult.total > 0 
        ? Math.round((sequenceResult.correct / sequenceResult.total) * 100) 
        : 0,
    },
    speedBonus: speedBonusResult,
    total: {
      baseScore,
      finalScore: baseScore + speedBonusResult.bonus,
      accuracy: Math.round(accuracy * 100) / 100,
    },
  }
}
