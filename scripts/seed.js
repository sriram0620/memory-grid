import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY not found in environment.')
  console.log('Ensure you are running with --env-file=.env')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function seedDatabase() {
  console.log('--- Database Reset & Seed ---')

  // 1. Clear existing sessions
  console.log('Attempting to clear leaderboard...')
  // Using a trick: delete where id is not null (if id is a column)
  // This will work if RLS allows deletion with ANON key
  const { error: deleteError } = await supabase
    .from('game_sessions')
    .delete()
    .not('id', 'is', null)

  if (deleteError) {
    console.warn('Warning: Could not delete all rows. RLS might be active. Error:', deleteError.message)
    console.log('Proceeding to insert anyway...')
  } else {
    console.log('Successfully cleared leaderboard.')
  }

  // 2. Insert dummy data
  const dummyData = [
    {
      player_name: 'Alex Chen',
      grid_size: 4,
      game_mode: 'full_challenge',
      total_score: 2850,
      accuracy_percentage: 95,
      total_time_taken: 112,
      phase_1_completed: true,
      phase_2_completed: true,
      phase_3_round1_completed: true,
      phase_3_round2_completed: true,
      phase_4_completed: true,
      completed_at: new Date(Date.now() - 86400000).toISOString()
    },
    {
      player_name: 'Sarah Smith',
      grid_size: 4,
      game_mode: 'full_challenge',
      total_score: 2420,
      accuracy_percentage: 88,
      total_time_taken: 145,
      phase_1_completed: true,
      phase_2_completed: true,
      phase_3_round1_completed: true,
      phase_3_round2_completed: true,
      phase_4_completed: true,
      completed_at: new Date(Date.now() - 43200000).toISOString()
    },
    {
      player_name: 'Brainiac_X',
      grid_size: 5,
      game_mode: 'full_challenge',
      total_score: 3100,
      accuracy_percentage: 98,
      total_time_taken: 98,
      phase_1_completed: true,
      phase_2_completed: true,
      phase_3_round1_completed: true,
      phase_3_round2_completed: true,
      phase_4_completed: true,
      completed_at: new Date(Date.now() - 18000000).toISOString()
    },
    {
      player_name: 'LazyPanda',
      grid_size: 3,
      game_mode: 'full_challenge',
      total_score: 1200,
      accuracy_percentage: 65,
      total_time_taken: 210,
      phase_1_completed: true,
      phase_2_completed: true,
      phase_3_round1_completed: false,
      phase_3_round2_completed: true,
      phase_4_completed: false,
      completed_at: new Date(Date.now() - 172800000).toISOString()
    },
    {
      player_name: 'MemoryKing',
      grid_size: 4,
      game_mode: 'full_challenge',
      total_score: 2650,
      accuracy_percentage: 92,
      total_time_taken: 120,
      phase_1_completed: true,
      phase_2_completed: true,
      phase_3_round1_completed: true,
      phase_3_round2_completed: true,
      phase_4_completed: true,
      completed_at: new Date(Date.now() - 3600000).toISOString()
    }
  ]

  console.log('Inserting dummy data...')
  const { data, error: insertError } = await supabase
    .from('game_sessions')
    .insert(dummyData)
    .select()

  if (insertError) {
    console.error('Error: Failed to insert dummy data:', insertError.message)
    console.log('\nNOTE: If you see RLS Policy errors, it means the database is protected.')
    console.log('You should run the SQL commands from database_reset.md manually in Supabase.')
  } else {
    console.log('Successfully added 5 top players to the leaderboard!')
  }

  console.log('\n--- Finished ---')
}

seedDatabase()
