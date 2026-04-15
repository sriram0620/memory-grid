import { v4 as uuidv4 } from 'uuid'
import {
  GridCell,
  CellContent,
  QuizQuestion,
  GameScore,
  GameState,
  GameTelemetry,
  GRID_CONFIG,
  SCORING_CONFIG,
} from './types'

// Generate a random grid with colors, numbers, and icons
export function generateGrid(size: number): GridCell[][] {
  const grid: GridCell[][] = []
  const contentTypes: ('color' | 'number' | 'icon')[] = ['color', 'number', 'icon']
  
  for (let row = 0; row < size; row++) {
    const rowCells: GridCell[] = []
    for (let col = 0; col < size; col++) {
      const type = contentTypes[Math.floor(Math.random() * contentTypes.length)]
      let value: string
      
      switch (type) {
        case 'color':
          value = GRID_CONFIG.COLORS[Math.floor(Math.random() * GRID_CONFIG.COLORS.length)]
          break
        case 'number':
          value = GRID_CONFIG.NUMBERS[Math.floor(Math.random() * GRID_CONFIG.NUMBERS.length)]
          break
        case 'icon':
          value = GRID_CONFIG.ICONS[Math.floor(Math.random() * GRID_CONFIG.ICONS.length)]
          break
      }
      
      rowCells.push({
        row,
        col,
        content: {
          type,
          value,
          id: uuidv4(),
        },
      })
    }
    grid.push(rowCells)
  }
  
  return grid
}

// Extract available elements from the grid for reconstruction
export function extractElements(grid: GridCell[][]): CellContent[] {
  const elements: CellContent[] = []
  
  for (const row of grid) {
    for (const cell of row) {
      if (cell.content) {
        elements.push({ ...cell.content, id: uuidv4() })
      }
    }
  }
  
  // Shuffle the elements
  return shuffleArray(elements)
}

// Create an empty grid for reconstruction
export function createEmptyGrid(size: number): GridCell[][] {
  const grid: GridCell[][] = []
  
  for (let row = 0; row < size; row++) {
    const rowCells: GridCell[] = []
    for (let col = 0; col < size; col++) {
      rowCells.push({
        row,
        col,
        content: null,
      })
    }
    grid.push(rowCells)
  }
  
  return grid
}

// Generate quiz questions based on the grid
export function generateQuizQuestions(grid: GridCell[][]): QuizQuestion[] {
  const questions: QuizQuestion[] = []
  const size = grid.length
  
  // Question 1: What was at a specific position? (MCQ)
  const randomRow1 = Math.floor(Math.random() * size)
  const randomCol1 = Math.floor(Math.random() * size)
  const correctCell = grid[randomRow1][randomCol1]
  
  if (correctCell.content) {
    const options = generateMCQOptions(correctCell.content, grid)
    questions.push({
      id: uuidv4(),
      type: 'mcq',
      question: `What was at position (${randomRow1 + 1}, ${randomCol1 + 1})?`,
      options,
      correctAnswer: formatCellContentForAnswer(correctCell.content),
      position: { row: randomRow1, col: randomCol1 },
    })
  }
  
  // Question 2: How many cells of a specific color? (Text Input)
  const colorToCount = GRID_CONFIG.COLORS[Math.floor(Math.random() * GRID_CONFIG.COLORS.length)]
  const colorCount = countCellsByColor(grid, colorToCount)
  const colorName = getColorName(colorToCount)
  
  questions.push({
    id: uuidv4(),
    type: 'text',
    question: `How many ${colorName} cells were present?`,
    correctAnswer: colorCount.toString(),
  })
  
  // Question 3: What type was at another position? (MCQ)
  const randomRow2 = Math.floor(Math.random() * size)
  const randomCol2 = Math.floor(Math.random() * size)
  const cell2 = grid[randomRow2][randomCol2]
  
  if (cell2.content) {
    questions.push({
      id: uuidv4(),
      type: 'mcq',
      question: `What type of element was at position (${randomRow2 + 1}, ${randomCol2 + 1})?`,
      options: ['Color', 'Number', 'Icon'],
      correctAnswer: cell2.content.type.charAt(0).toUpperCase() + cell2.content.type.slice(1),
      position: { row: randomRow2, col: randomCol2 },
    })
  }
  
  // Question 4: How many numbers were in the grid? (Text Input)
  const numberCount = countCellsByType(grid, 'number')
  questions.push({
    id: uuidv4(),
    type: 'text',
    question: 'How many number cells were in the grid?',
    correctAnswer: numberCount.toString(),
  })
  
  return questions
}

// Generate MCQ options for a cell
function generateMCQOptions(correct: CellContent, grid: GridCell[][]): string[] {
  const options: string[] = [formatCellContentForAnswer(correct)]
  const allContents: CellContent[] = []
  
  // Get all unique contents from grid
  for (const row of grid) {
    for (const cell of row) {
      if (cell.content && cell.content.id !== correct.id) {
        allContents.push(cell.content)
      }
    }
  }
  
  // Add random options
  const shuffled = shuffleArray(allContents)
  for (const content of shuffled) {
    const formatted = formatCellContentForAnswer(content)
    if (!options.includes(formatted) && options.length < 4) {
      options.push(formatted)
    }
  }
  
  // Fill remaining options if needed
  while (options.length < 4) {
    const type = correct.type
    let value: string
    
    switch (type) {
      case 'color':
        value = GRID_CONFIG.COLORS[Math.floor(Math.random() * GRID_CONFIG.COLORS.length)]
        break
      case 'number':
        value = GRID_CONFIG.NUMBERS[Math.floor(Math.random() * GRID_CONFIG.NUMBERS.length)]
        break
      case 'icon':
        value = GRID_CONFIG.ICONS[Math.floor(Math.random() * GRID_CONFIG.ICONS.length)]
        break
    }
    
    const formatted = formatCellContentForAnswer({ type, value, id: '' })
    if (!options.includes(formatted)) {
      options.push(formatted)
    }
  }
  
  return shuffleArray(options)
}

// Format cell content for display in quiz
export function formatCellContentForAnswer(content: CellContent): string {
  switch (content.type) {
    case 'color':
      return `${getColorName(content.value)} Color`
    case 'number':
      return `Number ${content.value}`
    case 'icon':
      return `${content.value.charAt(0).toUpperCase() + content.value.slice(1)} Icon`
    default:
      return content.value
  }
}

// Get color name from hex
export function getColorName(hex: string): string {
  const colorMap: Record<string, string> = {
    '#ef4444': 'Red',
    '#3b82f6': 'Blue',
    '#22c55e': 'Green',
    '#eab308': 'Yellow',
    '#a855f7': 'Purple',
    '#f97316': 'Orange',
    '#06b6d4': 'Cyan',
    '#ec4899': 'Pink',
    '#84cc16': 'Lime',
  }
  return colorMap[hex] || 'Unknown'
}

// Count cells by color
function countCellsByColor(grid: GridCell[][], color: string): number {
  let count = 0
  for (const row of grid) {
    for (const cell of row) {
      if (cell.content?.type === 'color' && cell.content.value === color) {
        count++
      }
    }
  }
  return count
}

// Count cells by type
function countCellsByType(grid: GridCell[][], type: 'color' | 'number' | 'icon'): number {
  let count = 0
  for (const row of grid) {
    for (const cell of row) {
      if (cell.content?.type === type) {
        count++
      }
    }
  }
  return count
}

// Generate a sequence for sequence match game
export function generateSequence(gridSize: number, length: number): { row: number; col: number }[] {
  const sequence: { row: number; col: number }[] = []
  
  for (let i = 0; i < length; i++) {
    const row = Math.floor(Math.random() * gridSize)
    const col = Math.floor(Math.random() * gridSize)
    sequence.push({ row, col })
  }
  
  return sequence
}

// Calculate the game score
export function calculateScore(
  originalGrid: GridCell[][],
  reconstructedGrid: GridCell[][],
  quizQuestions: QuizQuestion[],
  quizAnswers: Record<string, string>,
  sequence: { row: number; col: number }[],
  userSequence: { row: number; col: number }[],
  telemetry: GameTelemetry
): GameScore {
  // Calculate reconstruction score
  let correctPlacements = 0
  const totalPlacements = originalGrid.length * originalGrid[0].length
  
  for (let row = 0; row < originalGrid.length; row++) {
    for (let col = 0; col < originalGrid[row].length; col++) {
      const original = originalGrid[row][col].content
      const reconstructed = reconstructedGrid[row][col].content
      
      if (original && reconstructed) {
        if (original.type === reconstructed.type && original.value === reconstructed.value) {
          correctPlacements++
        }
      }
    }
  }
  
  // Calculate quiz score
  let correctQuizAnswers = 0
  for (const question of quizQuestions) {
    const userAnswer = quizAnswers[question.id]
    if (userAnswer && userAnswer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim()) {
      correctQuizAnswers++
    }
  }
  
  // Calculate sequence score
  let correctSequenceSteps = 0
  const totalSequenceSteps = sequence.length
  
  for (let i = 0; i < Math.min(sequence.length, userSequence.length); i++) {
    if (sequence[i].row === userSequence[i].row && sequence[i].col === userSequence[i].col) {
      correctSequenceSteps++
    } else {
      break // Stop at first mistake
    }
  }
  
  // Calculate raw scores
  const reconstructionScore = correctPlacements * SCORING_CONFIG.PLACEMENT_POINTS
  const quizScore = correctQuizAnswers * SCORING_CONFIG.QUIZ_POINTS
  const sequenceScore = correctSequenceSteps * SCORING_CONFIG.SEQUENCE_POINTS
  
  // Calculate speed bonus
  const totalTimeSeconds = telemetry.endTime 
    ? (telemetry.endTime - telemetry.startTime) / 1000 
    : 0
  
  const baseScore = reconstructionScore + quizScore + sequenceScore
  const speedBonus = calculateSpeedBonus(totalTimeSeconds, baseScore)
  
  // Calculate accuracy
  const totalAttempts = correctPlacements + quizQuestions.length + totalSequenceSteps
  const totalCorrect = correctPlacements + correctQuizAnswers + correctSequenceSteps
  const accuracy = totalAttempts > 0 ? (totalCorrect / totalAttempts) * 100 : 0
  
  return {
    reconstructionScore,
    quizScore,
    sequenceScore,
    totalScore: Math.round(baseScore + speedBonus),
    accuracy: Math.round(accuracy * 100) / 100,
    speedBonus: Math.round(speedBonus),
    breakdown: {
      correctPlacements,
      totalPlacements,
      correctQuizAnswers,
      totalQuizQuestions: quizQuestions.length,
      correctSequenceSteps,
      totalSequenceSteps,
    },
  }
}

// Calculate speed bonus
function calculateSpeedBonus(totalTimeSeconds: number, baseScore: number): number {
  const expectedTime = 120 // 2 minutes expected
  const timeDiff = expectedTime - totalTimeSeconds
  
  if (timeDiff <= 0) return 0
  
  const bonusPercentage = Math.min(timeDiff / expectedTime, SCORING_CONFIG.MAX_SPEED_BONUS)
  return baseScore * bonusPercentage
}

// Shuffle array helper
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// Initialize telemetry
export function initializeTelemetry(sessionId: string): GameTelemetry {
  return {
    sessionId,
    startTime: Date.now(),
    events: [],
    actions: [],
    phaseTimings: {},
  }
}

// Add telemetry event
export function addTelemetryEvent(
  telemetry: GameTelemetry,
  action: string,
  phase: GameState['phase'],
  details?: Record<string, unknown>
): GameTelemetry {
  return {
    ...telemetry,
    events: [
      ...telemetry.events,
      {
        timestamp: Date.now(),
        action,
        phase,
        details,
      },
    ],
  }
}

// Add action telemetry
export function addActionTelemetry(
  telemetry: GameTelemetry,
  action: string,
  duration: number,
  correct: boolean,
  details?: Record<string, unknown>
): GameTelemetry {
  return {
    ...telemetry,
    actions: [
      ...telemetry.actions,
      {
        action,
        timestamp: Date.now(),
        duration,
        correct,
        details,
      },
    ],
  }
}
