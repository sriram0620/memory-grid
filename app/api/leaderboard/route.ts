import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/leaderboard
 * 
 * Fetches the top scores from the database for the leaderboard.
 * Supports optional limit parameter (default: 10, max: 100).
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
    // Parse and validate limit parameter
    const limitParam = searchParams.get('limit')
    const limit = Math.min(Math.max(parseInt(limitParam || '10', 10), 1), 100)
    
    // Fetch top scores ordered by total_score descending
    const { data: sessions, error } = await supabase
      .from('game_sessions')
      .select('id, player_name, total_score, accuracy_percentage, total_time_taken, grid_size, created_at')
      .order('total_score', { ascending: false })
      .limit(limit)
    
    if (error) {
      console.error('Error fetching leaderboard:', error)
      return NextResponse.json(
        { error: 'Failed to fetch leaderboard' },
        { status: 500 }
      )
    }
    
    // Add rank to each entry
    const entries = (sessions || []).map((session, index) => ({
      ...session,
      rank: index + 1,
    }))
    
    return NextResponse.json({ entries })
  } catch (error) {
    console.error('Error in GET /api/leaderboard:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
