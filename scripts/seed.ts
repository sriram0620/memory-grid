import { createClient } from '@supabase/supabase-js'

// Environment variables expected to be provided via node --env-file=.env

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY not found in .env')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function seedDatabase() {
  console.log('--- Database Reset & Seed ---')

  // 1. Clear existing sessions
  // Note: Using a broad filter to delete all rows. 
  // This may fail if RLS is enabled and the ANON key doesn't have DELETE permissions.
  console.log('Attempting to clear leaderboard...')
  const { error: deleteError } = await supabase
    .from('game_sessions')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000') // Trick to match all UUIDs if id is UUID

  if (deleteError) {
    console.warn('Warning: Could not delete all rows. RLS might be active. Error:', deleteError.message)
    console.log('Proceeding to insert anyway...')
  } else {
    console.log('Successfully cleared leaderboard.')
  }

  // 2. Insert dummy data with realistic scores
  const dummyData = [
    {
      player_name: 'sriram',
      grid_size: 4,
      game_mode: 'full_challenge',
      total_score: 351,
      accuracy_percentage: 96,
      total_time_taken: 100,
      phase_1_completed: true,
      phase_2_completed: true,
      phase_3_round1_completed: true,
      phase_3_round2_completed: true,
      phase_4_completed: true,
      completed_at: new Date(Date.now() - 3600000).toISOString()
    },
    {
      player_name: 'sriram',
      grid_size: 4,
      game_mode: 'full_challenge',
      total_score: 255,
      accuracy_percentage: 84,
      total_time_taken: 136,
      phase_1_completed: true,
      phase_2_completed: true,
      phase_3_round1_completed: true,
      phase_3_round2_completed: true,
      phase_4_completed: true,
      completed_at: new Date(Date.now() - 86400000).toISOString()
    },
    {
      player_name: 'Dr_Brain',
      grid_size: 5,
      game_mode: 'full_challenge',
      total_score: 420,
      accuracy_percentage: 100,
      total_time_taken: 85,
      phase_1_completed: true,
      phase_2_completed: true,
      phase_3_round1_completed: true,
      phase_3_round2_completed: true,
      phase_4_completed: true,
      completed_at: new Date(Date.now() - 172800000 * 2).toISOString()
    },
    {
      player_name: 'Cyanide',
      grid_size: 4,
      game_mode: 'full_challenge',
      total_score: 385,
      accuracy_percentage: 98,
      total_time_taken: 92,
      phase_1_completed: true,
      phase_2_completed: true,
      phase_3_round1_completed: true,
      phase_3_round2_completed: true,
      phase_4_completed: true,
      completed_at: new Date(Date.now() - 43200000).toISOString()
    },
    {
      player_name: 'Luna_Maniac',
      grid_size: 3,
      game_mode: 'full_challenge',
      total_score: 180,
      accuracy_percentage: 75,
      total_time_taken: 150,
      phase_1_completed: true,
      phase_2_completed: true,
      phase_3_round1_completed: true,
      phase_3_round2_completed: false,
      phase_4_completed: true,
      completed_at: new Date(Date.now() - 259200000).toISOString()
    },
    {
      player_name: 'Alex Chen',
      grid_size: 4,
      game_mode: 'full_challenge',
      total_score: 310,
      accuracy_percentage: 92,
      total_time_taken: 110,
      phase_1_completed: true,
      phase_2_completed: true,
      phase_3_round1_completed: true,
      phase_3_round2_completed: true,
      phase_4_completed: true,
      completed_at: new Date(Date.now() - 86400000 * 3).toISOString()
    },
    {
      player_name: 'MemoryQueen',
      grid_size: 4,
      game_mode: 'full_challenge',
      total_score: 342,
      accuracy_percentage: 94,
      total_time_taken: 105,
      phase_1_completed: true,
      phase_2_completed: true,
      phase_3_round1_completed: true,
      phase_3_round2_completed: true,
      phase_4_completed: true,
      completed_at: new Date(Date.now() - 3600000 * 5).toISOString()
    },
    {
      player_name: 'N00b_Master',
      grid_size: 3,
      game_mode: 'full_challenge',
      total_score: 95,
      accuracy_percentage: 45,
      total_time_taken: 240,
      phase_1_completed: true,
      phase_2_completed: false,
      phase_3_round1_completed: true,
      phase_3_round2_completed: false,
      phase_4_completed: false,
      completed_at: new Date(Date.now() - 604800000).toISOString()
    }
  ]

  console.log('Inserting dummy data...')
  const { data, error: insertError } = await supabase
    .from('game_sessions')
    .insert(dummyData)
    .select()

  if (insertError) {
    console.error('Error: Failed to insert dummy data:', insertError.message)
    console.log('\nNOTE: If you see RLS Policy errors, you must run the SQL commands manually in the Supabase Dashboard SQL Editor.')
  } else {
    console.log('Successfully added 5 top players to the leaderboard!')
    console.log('Inserted IDs:', data.map(d => d.id).join(', '))
  }

  console.log('\n--- Finished ---')
}

seedDatabase()
