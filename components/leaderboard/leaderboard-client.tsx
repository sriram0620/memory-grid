'use client'

import { useState } from 'react'
import { Trophy, Medal, Clock, Target, User, Crown, Zap, Brain, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'

interface Session {
  id: string
  player_name: string
  total_score: number
  accuracy_percentage: number
  total_time_taken: number
}

interface LeaderboardClientProps {
  initialGlobalSessions: Session[]
  initialPersonalSessions: Session[]
}

export function LeaderboardClient({ initialGlobalSessions, initialPersonalSessions }: LeaderboardClientProps) {
  const [activeTab, setActiveTab] = useState<'global' | 'personal'>('global')
  
  const sessions = activeTab === 'global' ? initialGlobalSessions : initialPersonalSessions

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Tab Switcher */}
      <div className="flex justify-center">
        <div className="bg-secondary/30 p-1 rounded-2xl flex gap-1 border border-border/50">
          <button
            onClick={() => setActiveTab('global')}
            className={cn(
              "px-8 py-2.5 rounded-xl font-bold transition-all duration-300",
              activeTab === 'global' ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Global Rankings
          </button>
          <button
            onClick={() => setActiveTab('personal')}
            className={cn(
              "px-8 py-2.5 rounded-xl font-bold transition-all duration-300",
              activeTab === 'personal' ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground hover:text-foreground"
            )}
          >
            My Best Scores
          </button>
        </div>
      </div>

      {sessions.length === 0 ? (
        <Card className="p-12 text-center glass-card border-none">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 mb-6">
            <Trophy className="w-10 h-10 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No records found</h3>
          <p className="text-muted-foreground">Start playing to see your score here!</p>
        </Card>
      ) : (
        <>
          {/* Top 3 Podium (Only for Global or if enough Personal) */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Second Place */}
            <div className="order-1 md:order-1 md:self-end">
              {sessions[1] && (
                <Card className="glass-card rounded-3xl p-6 text-center hover-lift border-none relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Trophy className="w-16 h-16" />
                  </div>
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-300/20 border-2 border-gray-300 mb-4 font-black">2</div>
                  <h3 className="font-bold text-lg truncate">{sessions[1].player_name}</h3>
                  <div className="text-4xl font-black gradient-text mt-2">{sessions[1].total_score}</div>
                  <p className="text-sm font-bold text-muted-foreground mt-1 uppercase tracking-tighter">{sessions[1].accuracy_percentage}% Accuracy</p>
                </Card>
              )}
            </div>

            {/* First Place */}
            <div className="order-0 md:order-2">
              {sessions[0] && (
                <Card className="glass-card rounded-[2rem] p-10 text-center hover-lift border-2 border-warning/30 bg-warning/5 shadow-2xl shadow-warning/5 relative overflow-hidden group">
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-warning/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative inline-block mb-6">
                    <Crown className="w-10 h-10 text-warning absolute -top-6 left-1/2 -translate-x-1/2 drop-shadow-lg" />
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-warning/20 border-4 border-warning shadow-inner">
                      <span className="text-4xl font-black text-warning">1</span>
                    </div>
                  </div>
                  <h3 className="font-black text-2xl truncate mb-1">{sessions[0].player_name}</h3>
                  <div className="text-6xl font-black gradient-text-animated leading-none mb-4">{sessions[0].total_score}</div>
                  <p className="text-base font-bold text-muted-foreground uppercase tracking-widest">{sessions[0].accuracy_percentage}% High Precision</p>
                  <div className="mt-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-warning/20 text-warning text-xs font-black uppercase tracking-widest">
                    <Zap className="w-4 h-4" />
                    Elite Status
                  </div>
                </Card>
              )}
            </div>

            {/* Third Place */}
            <div className="order-2 md:order-3 md:self-end">
              {sessions[2] && (
                <Card className="glass-card rounded-3xl p-6 text-center hover-lift border-none relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Trophy className="w-16 h-16" />
                  </div>
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-orange-500/20 border-2 border-orange-500 mb-4 font-black">3</div>
                  <h3 className="font-bold text-lg truncate">{sessions[2].player_name}</h3>
                  <div className="text-4xl font-black gradient-text mt-2">{sessions[2].total_score}</div>
                  <p className="text-sm font-bold text-muted-foreground mt-1 uppercase tracking-tighter">{sessions[2].accuracy_percentage}% Accuracy</p>
                </Card>
              )}
            </div>
          </div>

          {/* Rankings List */}
          {sessions.length > 3 && (
            <Card className="glass-card rounded-[2rem] overflow-hidden border-none shadow-xl">
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <h3 className="font-black uppercase tracking-widest flex items-center gap-3">
                  <Medal className="w-6 h-6 text-primary" />
                  Hall of Fame
                </h3>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{sessions.length} Profiles</span>
              </div>
              <div className="divide-y divide-white/5">
                {sessions.slice(3).map((session, index) => (
                  <div
                    key={session.id}
                    className="flex items-center gap-6 p-5 hover:bg-white/[0.02] transition-colors group"
                  >
                    <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-secondary/50 text-foreground font-black text-lg group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                      {index + 4}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="font-bold text-lg truncate group-hover:text-primary transition-colors">{session.player_name}</span>
                      </div>
                      <div className="flex items-center gap-6 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                        <span className="flex items-center gap-1.5"><Target className="w-3.5 h-3.5 text-emerald-500" /> {session.accuracy_percentage}%</span>
                        <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-blue-500" /> {session.total_time_taken}s</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-black text-primary group-hover:scale-110 transition-transform">{session.total_score}</div>
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">PTS</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Aggregate Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Brain, label: 'Sessions', value: sessions.length, color: 'text-primary', bg: 'bg-primary/10' },
              { icon: Trophy, label: 'Top Score', value: Math.max(...sessions.map(s => s.total_score)), color: 'text-warning', bg: 'bg-warning/10' },
              { icon: TrendingUp, label: 'Avg Accuracy', value: `${Math.round(sessions.reduce((acc, s) => acc + (s.accuracy_percentage || 0), 0) / sessions.length)}%`, color: 'text-success', bg: 'bg-success/10' },
            ].map((stat) => (
              <Card key={stat.label} className="glass-card rounded-3xl p-6 border-none hover-lift text-center overflow-hidden relative group">
                <stat.icon className="absolute -bottom-2 -right-2 w-16 h-16 opacity-5 group-hover:opacity-10 transition-opacity" />
                <div className={cn("inline-flex p-3 rounded-2xl mb-4", stat.bg)}>
                  <stat.icon className={cn("w-6 h-6", stat.color)} />
                </div>
                <div className="text-3xl font-black">{stat.value}</div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">{stat.label}</p>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
