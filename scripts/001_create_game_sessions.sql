-- Game Sessions Table
-- Stores all game session data with comprehensive telemetry

CREATE TABLE IF NOT EXISTS game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_name TEXT NOT NULL DEFAULT 'Anonymous',
  grid_size INTEGER NOT NULL DEFAULT 4,
  game_mode TEXT NOT NULL CHECK (game_mode IN ('memory_grid', 'sequence_match', 'full_challenge')),
  
  -- Telemetry data (stored as JSONB for flexibility)
  telemetry JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Scoring
  total_score INTEGER NOT NULL DEFAULT 0,
  accuracy_percentage DECIMAL(5, 2) DEFAULT 0,
  
  -- Timing
  total_time_taken INTEGER NOT NULL DEFAULT 0, -- in milliseconds
  observation_time INTEGER DEFAULT 0,
  recall_time INTEGER DEFAULT 0,
  quiz_time INTEGER DEFAULT 0,
  sequence_time INTEGER DEFAULT 0,
  
  -- Actions tracking
  correct_actions INTEGER DEFAULT 0,
  incorrect_actions INTEGER DEFAULT 0,
  total_attempts INTEGER DEFAULT 0,
  
  -- Phase completion status
  phase_1_completed BOOLEAN DEFAULT FALSE,
  phase_2_completed BOOLEAN DEFAULT FALSE,
  phase_3_round1_completed BOOLEAN DEFAULT FALSE,
  phase_3_round2_completed BOOLEAN DEFAULT FALSE,
  phase_4_completed BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  
  -- Grid state snapshots
  original_grid JSONB,
  reconstructed_grid JSONB,
  sequence_inputs JSONB DEFAULT '[]'::jsonb
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_game_sessions_created_at ON game_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_game_sessions_total_score ON game_sessions(total_score DESC);
CREATE INDEX IF NOT EXISTS idx_game_sessions_player_name ON game_sessions(player_name);

-- Enable Row Level Security (for future auth implementation)
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;

-- Allow public insert and select for anonymous gameplay
CREATE POLICY "Allow public insert" ON game_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select" ON game_sessions FOR SELECT USING (true);
CREATE POLICY "Allow public update" ON game_sessions FOR UPDATE USING (true);
