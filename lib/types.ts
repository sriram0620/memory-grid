// Game Types and Interfaces

export type GameMode = 'memory_grid' | 'sequence_match' | 'full_challenge'

export type GamePhase = 
  | 'setup'
  | 'observation'
  | 'hide'
  | 'recall_reconstruct'
  | 'recall_quiz'
  | 'sequence_countdown'
  | 'sequence_watch'
  | 'sequence_replay'
  | 'results'

export type CellContent = {
  type: 'color' | 'number' | 'icon'
  value: string
  id: string
}

export type GridCell = {
  row: number
  col: number
  content: CellContent | null
}

export type QuizQuestion = {
  id: string
  type: 'mcq' | 'text'
  question: string
  options?: string[]
  correctAnswer: string
  position?: { row: number; col: number }
}

export type TelemetryEvent = {
  timestamp: number
  action: string
  phase: GamePhase
  details?: Record<string, unknown>
}

export type ActionTelemetry = {
  action: string
  timestamp: number
  duration: number
  correct: boolean
  details?: Record<string, unknown>
}

export type GameTelemetry = {
  sessionId: string
  startTime: number
  endTime?: number
  events: TelemetryEvent[]
  actions: ActionTelemetry[]
  phaseTimings: {
    observation?: { start: number; end: number }
    hide?: { start: number; end: number }
    recall_reconstruct?: { start: number; end: number }
    recall_quiz?: { start: number; end: number }
    sequence_watch?: { start: number; end: number }
    sequence_replay?: { start: number; end: number }
  }
}

export type GameScore = {
  reconstructionScore: number
  quizScore: number
  sequenceScore: number
  totalScore: number
  accuracy: number
  speedBonus: number
  breakdown: {
    correctPlacements: number
    totalPlacements: number
    correctQuizAnswers: number
    totalQuizQuestions: number
    correctSequenceSteps: number
    totalSequenceSteps: number
  }
}

export type GameState = {
  phase: GamePhase
  mode: GameMode
  gridSize: number
  originalGrid: GridCell[][]
  reconstructedGrid: GridCell[][]
  availableElements: CellContent[]
  quizQuestions: QuizQuestion[]
  quizAnswers: Record<string, string>
  sequence: { row: number; col: number }[]
  userSequence: { row: number; col: number }[]
  currentSequenceIndex: number
  telemetry: GameTelemetry
  score: GameScore
  playerName: string
  timeRemaining: number
  isComplete: boolean
}

export type GameSession = {
  id: string
  player_name: string
  grid_size: number
  game_mode: GameMode
  telemetry: GameTelemetry
  total_score: number
  accuracy_percentage: number
  total_time_taken: number
  observation_time: number
  recall_time: number
  quiz_time: number
  sequence_time: number
  correct_actions: number
  incorrect_actions: number
  total_attempts: number
  phase_1_completed: boolean
  phase_2_completed: boolean
  phase_3_round1_completed: boolean
  phase_3_round2_completed: boolean
  phase_4_completed: boolean
  created_at: string
  completed_at?: string
  original_grid: GridCell[][]
  reconstructed_grid: GridCell[][]
  sequence_inputs: { row: number; col: number }[]
}

// Scoring Constants
export const SCORING_CONFIG = {
  // Points per correct placement in reconstruction
  PLACEMENT_POINTS: 10,
  // Points per correct quiz answer
  QUIZ_POINTS: 15,
  // Points per correct sequence step
  SEQUENCE_POINTS: 20,
  // Maximum speed bonus percentage
  MAX_SPEED_BONUS: 0.25,
  // Time thresholds for speed bonus (seconds)
  SPEED_BONUS_THRESHOLDS: {
    reconstruction: 30, // Complete under 30s for max bonus
    quiz: 60,           // Complete under 60s for max bonus
    sequence: 15,       // Complete under 15s for max bonus
  },
  // Penalty for incorrect attempts
  INCORRECT_PENALTY: 2,
}

// Grid Configuration
export const GRID_CONFIG = {
  COLORS: [
    '#ef4444', // red
    '#3b82f6', // blue
    '#22c55e', // green
    '#eab308', // yellow
    '#a855f7', // purple
    '#f97316', // orange
    '#06b6d4', // cyan
    '#ec4899', // pink
    '#84cc16', // lime
  ],
  NUMBERS: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
  ICONS: ['star', 'heart', 'moon', 'sun', 'cloud', 'bolt', 'fire', 'leaf', 'diamond'],
  OBSERVATION_TIME: 8, // seconds
  RECONSTRUCTION_TIME: 60, // seconds
  QUIZ_TIME: 90, // seconds
  SEQUENCE_DISPLAY_TIME: 500, // ms per cell
  SEQUENCE_PAUSE: 3, // seconds
}
