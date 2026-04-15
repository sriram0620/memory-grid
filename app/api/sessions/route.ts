import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const data = await request.json()
    
    // Calculate metrics from telemetry
    const telemetry = data.telemetry || {}
    const startTime = telemetry.startTime || Date.now()
    const endTime = telemetry.endTime || Date.now()
    const totalTimeTaken = Math.round((endTime - startTime) / 1000)
    
    // Count correct and incorrect actions
    const actions = telemetry.actions || []
    const correctActions = actions.filter((a: { correct: boolean }) => a.correct).length
    const incorrectActions = actions.filter((a: { correct: boolean }) => !a.correct).length
    
    // Calculate phase times
    const phaseTimings = telemetry.phaseTimings || {}
    const observationTime = phaseTimings.observation 
      ? Math.round((phaseTimings.observation.end - phaseTimings.observation.start) / 1000)
      : 0
    const recallTime = phaseTimings.recall_reconstruct
      ? Math.round((phaseTimings.recall_reconstruct.end - phaseTimings.recall_reconstruct.start) / 1000)
      : 0
    const quizTime = phaseTimings.recall_quiz
      ? Math.round((phaseTimings.recall_quiz.end - phaseTimings.recall_quiz.start) / 1000)
      : 0
    const sequenceTime = phaseTimings.sequence_replay
      ? Math.round((phaseTimings.sequence_replay.end - phaseTimings.sequence_replay.start) / 1000)
      : 0
    
    const { data: session, error } = await supabase
      .from('game_sessions')
      .insert({
        player_name: data.playerName || 'Anonymous',
        grid_size: data.gridSize || 4,
        game_mode: data.gameMode || 'full_challenge',
        telemetry: data.telemetry || {},
        total_score: data.score?.totalScore || 0,
        accuracy_percentage: data.score?.accuracy || 0,
        total_time_taken: totalTimeTaken,
        observation_time: observationTime,
        recall_time: recallTime,
        quiz_time: quizTime,
        sequence_time: sequenceTime,
        correct_actions: correctActions,
        incorrect_actions: incorrectActions,
        total_attempts: actions.length,
        phase_1_completed: true,
        phase_2_completed: true,
        phase_3_round1_completed: data.score?.breakdown?.correctPlacements > 0,
        phase_3_round2_completed: data.score?.breakdown?.correctQuizAnswers > 0,
        phase_4_completed: data.score?.breakdown?.correctSequenceSteps > 0,
        original_grid: data.originalGrid || [],
        reconstructed_grid: data.reconstructedGrid || [],
        sequence_inputs: data.userSequence || [],
        completed_at: new Date().toISOString(),
      })
      .select()
      .single()
    
    if (error) {
      console.error('Error saving session:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ session })
  } catch (error) {
    console.error('Error in POST /api/sessions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const playerEmail = searchParams.get('email')
    const playerName = searchParams.get('name')
    const limit = parseInt(searchParams.get('limit') || '50')
    
    let query = supabase
      .from('game_sessions')
      .select('*')
      .order('total_score', { ascending: false })
      .limit(limit)
    
    // For now, sessions might not have emails if they were anonymous, 
    // but the user wants "My Leaderboard". We'll filter by name or email if possible.
    if (playerEmail) {
       // Assuming telemetry or metadata might have email, or we filter by player_name for now
       // If the table doesn't have email column yet, we should use a reasonable fallback.
       query = query.eq('player_name', playerEmail.split('@')[0])
    } else if (playerName) {
       query = query.eq('player_name', playerName)
    }
    
    const { data: sessions, error } = await query
    
    if (error) {
      console.error('Error fetching sessions:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ sessions })
  } catch (error) {
    console.error('Error in GET /api/sessions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
