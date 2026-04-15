import { createClient } from '@/lib/supabase/server'
import { Trophy } from 'lucide-react'
import { LeaderboardClient } from '@/components/leaderboard/leaderboard-client'

export default async function LeaderboardPage() {
  const supabase = await createClient()

  // Fetch Global Top Scores
  const { data: globalSessions } = await supabase
    .from('game_sessions')
    .select('*')
    .order('total_score', { ascending: false })
    .limit(20)

  // Fetch Personal Best Scores (if authenticated)
  const { data: { user } } = await supabase.auth.getUser()
  let personalSessions: any[] = []
  
  if (user) {
    const { data } = await supabase
      .from('game_sessions')
      .select('*')
      .eq('player_name', user.user_metadata?.display_name || user.email?.split('@')[0])
      .order('total_score', { ascending: false })
      .limit(20)
    personalSessions = data || []
  }

  return (
    <div className="min-h-screen bg-background bg-grid-pattern relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-warning/5 rounded-full blur-3xl opacity-50" />
      </div>

      {/* Header Sticky Container */}
      <div className="sticky top-0 z-30 pt-8 pb-4 px-4 bg-background/50 backdrop-blur-xl border-b border-border/10">
        <div className="container mx-auto max-w-5xl flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="p-2.5 rounded-xl bg-warning/10 border border-warning/10 shadow-lg shadow-warning/5 animate-glow-pulse">
              <Trophy className="w-5 h-5 text-warning" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter gradient-text-animated">Leaderboard</h1>
              <p className="text-muted-foreground font-bold uppercase tracking-[0.2em] text-[9px] opacity-60">Global Excellence & Personal Peaks</p>
            </div>
        </div>
      </div>

      <main className="relative z-10 container mx-auto px-4 py-12 max-w-5xl">
        <LeaderboardClient 
          initialGlobalSessions={globalSessions || []} 
          initialPersonalSessions={personalSessions} 
        />
      </main>
    </div>
  )
}
