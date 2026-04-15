'use client'

import { GameProvider, useGame } from '@/lib/game-context'
import { SetupScreen } from '@/components/game/setup-screen'
import { GameController } from '@/components/game/game-controller'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { Loader2 } from 'lucide-react'

function GameContent({ user }: { user: User }) {
  const { state, setPlayerName } = useGame()

  // Set player name from user metadata or email
  useEffect(() => {
    if (user && state.phase === 'setup') {
      const displayName = user.user_metadata?.display_name || user.email?.split('@')[0] || 'Player'
      setPlayerName(displayName)
    }
  }, [user, state.phase, setPlayerName])

  if (state.phase === 'setup') {
    return (
      <main className="min-h-screen bg-background bg-grid-pattern flex items-center justify-center py-8 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/5 rounded-full blur-3xl animate-float delay-500" />
        </div>
        <SetupScreen userEmail={user.email} />
      </main>
    )
  }

  return <GameController />
}

function PlayPageContent() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading game...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Redirecting to login...</p>
      </div>
    )
  }

  return (
    <GameContent user={user} />
  )
}

export default function PlayPage() {
  return <PlayPageContent />
}
