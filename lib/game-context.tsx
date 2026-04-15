'use client'

import { createContext, useContext, useReducer, useCallback, ReactNode } from 'react'
import { v4 as uuidv4 } from 'uuid'
import {
  GameState,
  GamePhase,
  GameMode,
  CellContent,
  GridCell,
  GRID_CONFIG,
} from './types'
import {
  generateGrid,
  extractElements,
  createEmptyGrid,
  generateQuizQuestions,
  generateSequence,
  calculateScore,
  initializeTelemetry,
  addTelemetryEvent,
  addActionTelemetry,
} from './game-utils'

type GameAction =
  | { type: 'START_GAME'; payload: { mode: GameMode; gridSize: number; playerName: string } }
  | { type: 'SET_PHASE'; payload: GamePhase }
  | { type: 'PLACE_ELEMENT'; payload: { row: number; col: number; element: CellContent } }
  | { type: 'REMOVE_ELEMENT'; payload: { row: number; col: number } }
  | { type: 'ANSWER_QUIZ'; payload: { questionId: string; answer: string } }
  | { type: 'ADD_SEQUENCE_INPUT'; payload: { row: number; col: number } }
  | { type: 'RESET_SEQUENCE'; }
  | { type: 'SET_TIME_REMAINING'; payload: number }
  | { type: 'FINISH_GAME' }
  | { type: 'RESET_GAME' }
  | { type: 'LOG_EVENT'; payload: { action: string; details?: Record<string, unknown> } }
  | { type: 'LOG_ACTION'; payload: { action: string; duration: number; correct: boolean; details?: Record<string, unknown> } }
  | { type: 'SET_PLAYER_NAME'; payload: string }

const initialScore = {
  reconstructionScore: 0,
  quizScore: 0,
  sequenceScore: 0,
  totalScore: 0,
  accuracy: 0,
  speedBonus: 0,
  breakdown: {
    correctPlacements: 0,
    totalPlacements: 0,
    correctQuizAnswers: 0,
    totalQuizQuestions: 0,
    correctSequenceSteps: 0,
    totalSequenceSteps: 0,
  },
}

const initialState: GameState = {
  phase: 'setup',
  mode: 'full_challenge',
  gridSize: 4,
  originalGrid: [],
  reconstructedGrid: [],
  availableElements: [],
  quizQuestions: [],
  quizAnswers: {},
  sequence: [],
  userSequence: [],
  currentSequenceIndex: 0,
  telemetry: initializeTelemetry(uuidv4()),
  score: initialScore,
  playerName: '',
  timeRemaining: 0,
  isComplete: false,
}

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_GAME': {
      const { mode, gridSize, playerName } = action.payload
      const originalGrid = generateGrid(gridSize)
      const availableElements = extractElements(originalGrid)
      const quizQuestions = generateQuizQuestions(originalGrid)
      const sequenceLength = gridSize === 3 ? 4 : 5
      const sequence = generateSequence(gridSize, sequenceLength)
      
      return {
        ...state,
        phase: 'observation',
        mode,
        gridSize,
        playerName,
        originalGrid,
        reconstructedGrid: createEmptyGrid(gridSize),
        availableElements,
        quizQuestions,
        quizAnswers: {},
        sequence,
        userSequence: [],
        currentSequenceIndex: 0,
        telemetry: addTelemetryEvent(
          { ...initializeTelemetry(uuidv4()), phaseTimings: { observation: { start: Date.now(), end: 0 } } },
          'game_started',
          'observation',
          { mode, gridSize }
        ),
        score: initialScore,
        timeRemaining: GRID_CONFIG.OBSERVATION_TIME,
        isComplete: false,
      }
    }
    
    case 'SET_PHASE': {
      const phase = action.payload
      const now = Date.now()
      const updatedTelemetry = { ...state.telemetry }
      
      // Update phase timings
      const currentPhase = state.phase
      if (updatedTelemetry.phaseTimings[currentPhase as keyof typeof updatedTelemetry.phaseTimings]) {
        const timing = updatedTelemetry.phaseTimings[currentPhase as keyof typeof updatedTelemetry.phaseTimings]
        if (timing) {
          timing.end = now
        }
      }
      
      // Initialize new phase timing
      updatedTelemetry.phaseTimings[phase as keyof typeof updatedTelemetry.phaseTimings] = {
        start: now,
        end: 0,
      }
      
      // Set appropriate time for each phase
      let timeRemaining = state.timeRemaining
      if (phase === 'recall_reconstruct') {
        timeRemaining = GRID_CONFIG.RECONSTRUCTION_TIME
      } else if (phase === 'recall_quiz') {
        timeRemaining = GRID_CONFIG.QUIZ_TIME
      } else if (phase === 'sequence_countdown') {
        timeRemaining = 5 // 5 second countdown before sequence
      } else if (phase === 'sequence_watch') {
        timeRemaining = 0 // Controlled by sequence display
      } else if (phase === 'sequence_replay') {
        timeRemaining = 30 // 30 seconds to replay sequence
      }
      
      return {
        ...state,
        phase,
        timeRemaining,
        telemetry: addTelemetryEvent(updatedTelemetry, `phase_changed_to_${phase}`, phase),
      }
    }
    
    case 'PLACE_ELEMENT': {
      const { row, col, element } = action.payload
      const newReconstructedGrid = state.reconstructedGrid.map(r => r.map(c => ({ ...c })))
      
      // Check if the cell already has content
      const existingContent = newReconstructedGrid[row][col].content
      
      // Place the new element
      newReconstructedGrid[row][col].content = element
      
      // Update available elements
      let newAvailableElements = state.availableElements.filter(e => e.id !== element.id)
      
      // If there was existing content, return it to available
      if (existingContent) {
        newAvailableElements = [...newAvailableElements, { ...existingContent, id: uuidv4() }]
      }
      
      // Check if placement is correct
      const originalContent = state.originalGrid[row][col].content
      const isCorrect = originalContent?.type === element.type && originalContent?.value === element.value
      
      return {
        ...state,
        reconstructedGrid: newReconstructedGrid,
        availableElements: newAvailableElements,
        telemetry: addActionTelemetry(
          state.telemetry,
          'element_placed',
          0,
          isCorrect,
          { row, col, element }
        ),
      }
    }
    
    case 'REMOVE_ELEMENT': {
      const { row, col } = action.payload
      const content = state.reconstructedGrid[row][col].content
      
      if (!content) return state
      
      const newReconstructedGrid = state.reconstructedGrid.map(r => r.map(c => ({ ...c })))
      newReconstructedGrid[row][col].content = null
      
      return {
        ...state,
        reconstructedGrid: newReconstructedGrid,
        availableElements: [...state.availableElements, { ...content, id: uuidv4() }],
        telemetry: addTelemetryEvent(state.telemetry, 'element_removed', state.phase, { row, col }),
      }
    }
    
    case 'ANSWER_QUIZ': {
      const { questionId, answer } = action.payload
      const question = state.quizQuestions.find(q => q.id === questionId)
      const isCorrect = question?.correctAnswer.toLowerCase().trim() === answer.toLowerCase().trim()
      
      return {
        ...state,
        quizAnswers: { ...state.quizAnswers, [questionId]: answer },
        telemetry: addActionTelemetry(
          state.telemetry,
          'quiz_answered',
          0,
          isCorrect,
          { questionId, answer, correct: question?.correctAnswer }
        ),
      }
    }
    
    case 'ADD_SEQUENCE_INPUT': {
      const { row, col } = action.payload
      const newUserSequence = [...state.userSequence, { row, col }]
      const stepIndex = newUserSequence.length - 1
      const expectedStep = state.sequence[stepIndex]
      const isCorrect = expectedStep?.row === row && expectedStep?.col === col
      
      return {
        ...state,
        userSequence: newUserSequence,
        telemetry: addActionTelemetry(
          state.telemetry,
          'sequence_input',
          0,
          isCorrect,
          { row, col, stepIndex, expected: expectedStep }
        ),
      }
    }
    
    case 'RESET_SEQUENCE': {
      return {
        ...state,
        userSequence: [],
        currentSequenceIndex: 0,
      }
    }
    
    case 'SET_TIME_REMAINING': {
      return {
        ...state,
        timeRemaining: action.payload,
      }
    }
    
    case 'FINISH_GAME': {
      if (state.phase === 'results' || state.isComplete) return state
      
      const finalTelemetry = {
        ...state.telemetry,
        endTime: Date.now(),
      }
      
      const score = calculateScore(
        state.originalGrid,
        state.reconstructedGrid,
        state.quizQuestions,
        state.quizAnswers,
        state.sequence,
        state.userSequence,
        finalTelemetry
      )
      
      return {
        ...state,
        phase: 'results',
        telemetry: finalTelemetry,
        score,
        isComplete: true,
      }
    }
    
    case 'RESET_GAME': {
      return {
        ...initialState,
        telemetry: initializeTelemetry(uuidv4()),
      }
    }
    
    case 'LOG_EVENT': {
      return {
        ...state,
        telemetry: addTelemetryEvent(state.telemetry, action.payload.action, state.phase, action.payload.details),
      }
    }
    
    case 'LOG_ACTION': {
      return {
        ...state,
        telemetry: addActionTelemetry(
          state.telemetry,
          action.payload.action,
          action.payload.duration,
          action.payload.correct,
          action.payload.details
        ),
      }
    }

    case 'SET_PLAYER_NAME': {
      return {
        ...state,
        playerName: action.payload,
      }
    }
    
    default:
      return state
  }
}

type GameContextType = {
  state: GameState
  startGame: (mode: GameMode, gridSize: number, playerName: string) => void
  setPhase: (phase: GamePhase) => void
  placeElement: (row: number, col: number, element: CellContent) => void
  removeElement: (row: number, col: number) => void
  answerQuiz: (questionId: string, answer: string) => void
  addSequenceInput: (row: number, col: number) => void
  resetSequence: () => void
  setTimeRemaining: (time: number) => void
  finishGame: () => void
  resetGame: () => void
  logEvent: (action: string, details?: Record<string, unknown>) => void
  setPlayerName: (name: string) => void
}

const GameContext = createContext<GameContextType | undefined>(undefined)

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState)
  
  const startGame = useCallback((mode: GameMode, gridSize: number, playerName: string) => {
    dispatch({ type: 'START_GAME', payload: { mode, gridSize, playerName } })
  }, [])
  
  const setPhase = useCallback((phase: GamePhase) => {
    dispatch({ type: 'SET_PHASE', payload: phase })
  }, [])
  
  const placeElement = useCallback((row: number, col: number, element: CellContent) => {
    dispatch({ type: 'PLACE_ELEMENT', payload: { row, col, element } })
  }, [])
  
  const removeElement = useCallback((row: number, col: number) => {
    dispatch({ type: 'REMOVE_ELEMENT', payload: { row, col } })
  }, [])
  
  const answerQuiz = useCallback((questionId: string, answer: string) => {
    dispatch({ type: 'ANSWER_QUIZ', payload: { questionId, answer } })
  }, [])
  
  const addSequenceInput = useCallback((row: number, col: number) => {
    dispatch({ type: 'ADD_SEQUENCE_INPUT', payload: { row, col } })
  }, [])
  
  const resetSequence = useCallback(() => {
    dispatch({ type: 'RESET_SEQUENCE' })
  }, [])
  
  const setTimeRemaining = useCallback((time: number) => {
    dispatch({ type: 'SET_TIME_REMAINING', payload: time })
  }, [])
  
  const finishGame = useCallback(() => {
    dispatch({ type: 'FINISH_GAME' })
  }, [])
  
  const resetGame = useCallback(() => {
    dispatch({ type: 'RESET_GAME' })
  }, [])
  
  const logEvent = useCallback((action: string, details?: Record<string, unknown>) => {
    dispatch({ type: 'LOG_EVENT', payload: { action, details } })
  }, [])

  const setPlayerName = useCallback((name: string) => {
    dispatch({ type: 'SET_PLAYER_NAME', payload: name })
  }, [])
  
  return (
    <GameContext.Provider
      value={{
        state,
        startGame,
        setPhase,
        placeElement,
        removeElement,
        answerQuiz,
        addSequenceInput,
        resetSequence,
        setTimeRemaining,
        finishGame,
        resetGame,
        logEvent,
        setPlayerName,
      }}
    >
      {children}
    </GameContext.Provider>
  )
}

export function useGame() {
  const context = useContext(GameContext)
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider')
  }
  return context
}
