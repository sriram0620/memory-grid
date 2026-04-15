/**
 * API Service
 * 
 * Client-side API functions for the Memory Grid Challenge game.
 * Handles all communication with the backend.
 */

import { GameScore, GameTelemetry, GridCell, GameMode } from '@/lib/types'

export interface SaveSessionPayload {
  playerName: string
  gridSize: number
  gameMode: GameMode
  telemetry: GameTelemetry
  score: GameScore
  originalGrid: GridCell[][]
  reconstructedGrid: GridCell[][]
  userSequence: { row: number; col: number }[]
}

export interface GameSessionResponse {
  id: string
  player_name: string
  grid_size: number
  game_mode: string
  total_score: number
  accuracy_percentage: number
  total_time_taken: number
  created_at: string
}

export interface LeaderboardEntry {
  id: string
  player_name: string
  total_score: number
  accuracy_percentage: number
  total_time_taken: number
  grid_size: number
  created_at: string
  rank: number
}

/**
 * Saves a game session to the database
 */
export async function saveGameSession(payload: SaveSessionPayload): Promise<{ success: boolean; session?: GameSessionResponse; error?: string }> {
  try {
    const response = await fetch('/api/sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return { success: false, error: errorData.error || 'Failed to save session' }
    }

    const data = await response.json()
    return { success: true, session: data.session }
  } catch (error) {
    console.error('Error saving game session:', error)
    return { success: false, error: 'Network error. Please try again.' }
  }
}

/**
 * Fetches leaderboard data
 */
export async function fetchLeaderboard(limit = 10): Promise<{ success: boolean; entries?: LeaderboardEntry[]; error?: string }> {
  try {
    const response = await fetch(`/api/leaderboard?limit=${limit}`)

    if (!response.ok) {
      const errorData = await response.json()
      return { success: false, error: errorData.error || 'Failed to fetch leaderboard' }
    }

    const data = await response.json()
    return { success: true, entries: data.entries }
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    return { success: false, error: 'Network error. Please try again.' }
  }
}

/**
 * Fetches recent game sessions
 */
export async function fetchRecentSessions(limit = 50): Promise<{ success: boolean; sessions?: GameSessionResponse[]; error?: string }> {
  try {
    const response = await fetch(`/api/sessions?limit=${limit}`)

    if (!response.ok) {
      const errorData = await response.json()
      return { success: false, error: errorData.error || 'Failed to fetch sessions' }
    }

    const data = await response.json()
    return { success: true, sessions: data.sessions }
  } catch (error) {
    console.error('Error fetching sessions:', error)
    return { success: false, error: 'Network error. Please try again.' }
  }
}

/**
 * Fetches a single game session by ID
 */
export async function fetchSession(sessionId: string): Promise<{ success: boolean; session?: GameSessionResponse; error?: string }> {
  try {
    const response = await fetch(`/api/sessions/${sessionId}`)

    if (!response.ok) {
      const errorData = await response.json()
      return { success: false, error: errorData.error || 'Session not found' }
    }

    const data = await response.json()
    return { success: true, session: data.session }
  } catch (error) {
    console.error('Error fetching session:', error)
    return { success: false, error: 'Network error. Please try again.' }
  }
}
