/**
 * Telemetry Service
 * 
 * Handles all telemetry tracking for the Memory Grid Challenge game.
 * Captures timestamps, action durations, and performance metrics.
 */

import { GameTelemetry, TelemetryEvent, ActionTelemetry, GamePhase } from '@/lib/types'
import { v4 as uuidv4 } from 'uuid'

/**
 * Creates a new telemetry session
 */
export function createTelemetrySession(): GameTelemetry {
  return {
    sessionId: uuidv4(),
    startTime: Date.now(),
    events: [],
    actions: [],
    phaseTimings: {},
  }
}

/**
 * Records a game event (phase changes, game start/end, etc.)
 */
export function recordEvent(
  telemetry: GameTelemetry,
  action: string,
  phase: GamePhase,
  details?: Record<string, unknown>
): GameTelemetry {
  const event: TelemetryEvent = {
    timestamp: Date.now(),
    action,
    phase,
    details,
  }

  return {
    ...telemetry,
    events: [...telemetry.events, event],
  }
}

/**
 * Records a user action with timing information
 */
export function recordAction(
  telemetry: GameTelemetry,
  action: string,
  correct: boolean,
  details?: Record<string, unknown>
): GameTelemetry {
  // Calculate duration from last action or phase start
  const lastActionTime = telemetry.actions.length > 0
    ? telemetry.actions[telemetry.actions.length - 1].timestamp
    : telemetry.startTime

  const actionEntry: ActionTelemetry = {
    action,
    timestamp: Date.now(),
    duration: Date.now() - lastActionTime,
    correct,
    details,
  }

  return {
    ...telemetry,
    actions: [...telemetry.actions, actionEntry],
  }
}

/**
 * Starts timing for a specific phase
 */
export function startPhaseTimer(
  telemetry: GameTelemetry,
  phase: GamePhase
): GameTelemetry {
  return {
    ...telemetry,
    phaseTimings: {
      ...telemetry.phaseTimings,
      [phase]: {
        start: Date.now(),
        end: 0,
      },
    },
  }
}

/**
 * Ends timing for a specific phase
 */
export function endPhaseTimer(
  telemetry: GameTelemetry,
  phase: GamePhase
): GameTelemetry {
  const phaseTiming = telemetry.phaseTimings[phase as keyof typeof telemetry.phaseTimings]
  
  if (!phaseTiming) {
    return telemetry
  }

  return {
    ...telemetry,
    phaseTimings: {
      ...telemetry.phaseTimings,
      [phase]: {
        ...phaseTiming,
        end: Date.now(),
      },
    },
  }
}

/**
 * Finalizes telemetry when game ends
 */
export function finalizeTelemetry(telemetry: GameTelemetry): GameTelemetry {
  return {
    ...telemetry,
    endTime: Date.now(),
  }
}

/**
 * Calculates aggregate metrics from telemetry
 */
export function calculateMetrics(telemetry: GameTelemetry) {
  const totalTimeMs = telemetry.endTime
    ? telemetry.endTime - telemetry.startTime
    : Date.now() - telemetry.startTime

  const correctActions = telemetry.actions.filter((a) => a.correct).length
  const incorrectActions = telemetry.actions.filter((a) => !a.correct).length
  const totalAttempts = telemetry.actions.length

  // Calculate average time per action
  const actionDurations = telemetry.actions.map((a) => a.duration)
  const averageTimePerAction = actionDurations.length > 0
    ? actionDurations.reduce((sum, d) => sum + d, 0) / actionDurations.length
    : 0

  // Calculate phase durations
  const phaseDurations: Record<string, number> = {}
  for (const [phase, timing] of Object.entries(telemetry.phaseTimings)) {
    if (timing && timing.end > 0) {
      phaseDurations[phase] = timing.end - timing.start
    }
  }

  return {
    totalTimeMs,
    totalTimeSeconds: Math.round(totalTimeMs / 1000),
    correctActions,
    incorrectActions,
    totalAttempts,
    accuracy: totalAttempts > 0 ? (correctActions / totalAttempts) * 100 : 0,
    averageTimePerAction: Math.round(averageTimePerAction),
    phaseDurations,
  }
}

/**
 * Exports telemetry data for API submission
 */
export function exportTelemetryForAPI(telemetry: GameTelemetry) {
  const metrics = calculateMetrics(telemetry)

  return {
    sessionId: telemetry.sessionId,
    startTime: telemetry.startTime,
    endTime: telemetry.endTime,
    events: telemetry.events,
    actions: telemetry.actions,
    phaseTimings: telemetry.phaseTimings,
    metrics,
  }
}
