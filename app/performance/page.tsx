'use client'

import React, { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { 
  TrendingUp, 
  Calendar, 
  BarChart3, 
  Clock, 
  Target,
  ArrowUpRight,
  History,
  Brain,
  Zap,
  Trophy
} from 'lucide-react'
import ReactECharts from 'echarts-for-react'
import { cn } from '@/lib/utils'

// Mock data for initial design - will replace with Supabase data
const mockSessions = [
  { id: 1, score: 850, accuracy: 92, time: 45, date: '2024-03-10' },
  { id: 2, score: 720, accuracy: 88, time: 52, date: '2024-03-11' },
  { id: 3, score: 940, accuracy: 95, time: 38, date: '2024-03-12' },
  { id: 4, score: 880, accuracy: 90, time: 42, date: '2024-03-13' },
  { id: 5, score: 1050, accuracy: 98, time: 35, date: '2024-03-14' },
]

export default function PerformancePage() {
  const [sessions, setSessions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchSessions() {
      try {
        const response = await fetch('/api/sessions')
        const data = await response.json()
        if (data.sessions) {
          setSessions(data.sessions)
        } else {
          setSessions(mockSessions) // Fallback to mock
        }
      } catch (err) {
        console.error('Failed to fetch sessions:', err)
        setSessions(mockSessions)
      } finally {
        setLoading(false)
      }
    }
    fetchSessions()
  }, [])

  const scoreChartOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      borderColor: '#333',
      textStyle: { color: '#fff' }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: sessions.map(s => new Date(s.created_at || s.date).toLocaleDateString()),
      axisLabel: { color: '#888' },
      axisLine: { lineStyle: { color: '#333' } }
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#888' },
      splitLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.05)' } }
    },
    series: [
      {
        name: 'Total Score',
        type: 'line',
        smooth: true,
        data: sessions.map(s => s.total_score || s.score),
        itemStyle: { color: '#3b82f6' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(59, 130, 246, 0.3)' },
              { offset: 1, color: 'rgba(59, 130, 246, 0)' }
            ]
          }
        },
        symbol: 'circle',
        symbolSize: 8,
      }
    ]
  }

  const accuracyChartOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      textStyle: { color: '#fff' }
    },
    legend: {
      bottom: '0',
      left: 'center',
      textStyle: { color: '#888' }
    },
    series: [
      {
        name: 'Accuracy',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: 'transparent',
          borderWidth: 2
        },
        label: { show: false },
        emphasis: {
          label: {
            show: true,
            fontSize: 20,
            fontWeight: 'bold'
          }
        },
        data: [
          { value: sessions.reduce((acc, s) => acc + (s.accuracy_percentage || s.accuracy), 0) / sessions.length, name: 'Average Accuracy', itemStyle: { color: '#10b981' } },
          { value: 100 - (sessions.reduce((acc, s) => acc + (s.accuracy_percentage || s.accuracy), 0) / sessions.length), name: 'Margin', itemStyle: { color: 'rgba(255, 255, 255, 0.05)' } }
        ]
      }
    ]
  }

  const skillChartOption = {
    backgroundColor: 'transparent',
    radar: {
      indicator: [
        { name: 'Observation', max: 100 },
        { name: 'Recall', max: 100 },
        { name: 'Quiz', max: 100 },
        { name: 'Sequence', max: 100 },
        { name: 'Speed', max: 100 }
      ],
      splitArea: { show: false },
      axisLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.1)' } },
      splitLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.1)' } }
    },
    series: [{
      type: 'radar',
      data: [{
        value: [85, 90, 75, 80, 70], // Mock skill data
        name: 'Skill Profile',
        areaStyle: { color: 'rgba(139, 92, 246, 0.3)' },
        lineStyle: { color: '#8b5cf6' },
        itemStyle: { color: '#8b5cf6' }
      }]
    }]
  }

  return (
    <div className="min-h-screen bg-background p-6 md:p-10 space-y-10 bg-grid-pattern overflow-y-auto">
      {/* Header Section with Glass Effect */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 animate-slide-down">
        <div>
          <h1 className="text-2xl font-black tracking-tighter gradient-text-animated mb-1">My Progress</h1>
          <p className="text-muted-foreground text-sm font-medium opacity-70">Elevating your cognitive potential, session by session.</p>
        </div>
        <div className="flex items-center gap-2.5 px-4 py-1.5 glass-strong rounded-xl border border-primary/20 shadow-lg shadow-primary/5">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-bold text-sm tracking-tight">{new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
        </div>
      </div>

      {/* Stats Grid - Bento Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-scale-in">
        {[
          { label: 'Avg Score', value: Math.round(sessions.reduce((acc, s) => acc + (s.total_score || s.score || 0), 0) / (sessions.length || 1)), icon: TrendingUp, color: 'text-blue-500', bg: 'bg-blue-500/10', trend: '+12%' },
          { label: 'High Score', value: Math.max(...sessions.map(s => s.total_score || s.score || 0)), icon: Trophy, color: 'text-amber-500', bg: 'bg-amber-500/10', trend: 'Record' },
          { label: 'Avg Accuracy', value: `${Math.round(sessions.reduce((acc, s) => acc + (s.accuracy_percentage || s.accuracy || 0), 0) / (sessions.length || 1))}%`, icon: Target, color: 'text-emerald-500', bg: 'bg-emerald-500/10', trend: 'Steady' },
          { label: 'Sessions', value: sessions.length, icon: History, color: 'text-purple-500', bg: 'bg-purple-500/10', trend: 'Active' },
        ].map((stat, i) => (
          <Card key={stat.label} className="p-5 glass-card hover-lift border-none group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
              <stat.icon className="w-12 h-12" />
            </div>
            <div className="flex justify-between items-start mb-3">
              <div className={cn("p-2 rounded-xl", stat.bg)}>
                <stat.icon className={cn("w-5 h-5", stat.color)} />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 border border-white/10 uppercase tracking-tighter">{stat.trend}</span>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-0.5">{stat.label}</p>
              <h3 className="text-2xl font-black">{stat.value}</h3>
            </div>
          </Card>
        ))}
      </div>

      {/* Main Charts Section - High Tech Look */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <Card className="lg:col-span-8 p-8 glass-card border-none animate-slide-up relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-primary/40 group-hover:bg-primary transition-colors" />
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <BarChart3 className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-lg font-black uppercase tracking-tight">Performance Evolution</h3>
            </div>
          </div>
          <div className="h-[400px] w-full">
            <ReactECharts option={scoreChartOption} style={{ height: '100%', width: '100%' }} />
          </div>
        </Card>

        <div className="lg:col-span-4 space-y-8">
          <Card className="p-8 glass-card border-none animate-slide-up relative overflow-hidden group" style={{ animationDelay: '100ms' }}>
             <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/40 group-hover:bg-emerald-500 transition-colors" />
            <div className="flex items-center gap-3 mb-8">
               <div className="p-2 rounded-lg bg-emerald-500/20">
                <Target className="w-6 h-6 text-emerald-500" />
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tight">Cognitive Radar</h3>
            </div>
            <div className="h-[300px] w-full">
              <ReactECharts option={skillChartOption} style={{ height: '100%', width: '100%' }} />
            </div>
          </Card>

          <Card className="p-6 glass-card border-none animate-slide-up bg-accent/5 hover:bg-accent/10 transition-colors cursor-pointer group" style={{ animationDelay: '200ms' }}>
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                   <div className="p-3 rounded-full bg-accent/20 group-hover:rotate-12 transition-transform">
                      <Zap className="w-6 h-6 text-accent" />
                   </div>
                   <div>
                      <h4 className="font-bold">Next Milestone</h4>
                      <p className="text-xs text-muted-foreground">Reach 2000 points</p>
                   </div>
                </div>
                <div className="h-12 w-12 rounded-full border-2 border-accent/20 flex items-center justify-center font-bold text-accent">
                   75%
                </div>
             </div>
          </Card>
        </div>
      </div>

      {/* Detailed Table Section */}
      <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
        <Card className="glass-card border-none overflow-hidden">
          <div className="p-6 border-b border-border/50 flex items-center justify-between bg-white/5">
            <div className="flex items-center gap-3">
              <History className="w-6 h-6 text-purple-500" />
              <h3 className="text-xl font-bold">Session History</h3>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-secondary/30 text-muted-foreground text-sm uppercase tracking-wider">
                  <th className="px-8 py-4 font-semibold">Date</th>
                  <th className="px-8 py-4 font-semibold">Mode</th>
                  <th className="px-8 py-4 font-semibold">Grid</th>
                  <th className="px-8 py-4 font-semibold">Score</th>
                  <th className="px-8 py-4 font-semibold">Accuracy</th>
                  <th className="px-8 py-4 font-semibold">Time</th>
                  <th className="px-8 py-4 font-semibold text-right">Trend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {sessions.slice(0, 10).map((session, i) => (
                  <tr key={session.id} className="hover:bg-primary/5 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="font-semibold">{new Date(session.created_at || session.date).toLocaleDateString()}</span>
                        <span className="text-xs text-muted-foreground">{new Date(session.created_at || session.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-secondary border border-border/50 capitalize text-foreground">
                        {(session.game_mode || 'Classic').replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-8 py-5 font-medium text-muted-foreground">{session.grid_size || 4}x{session.grid_size || 4}</td>
                    <td className="px-8 py-5">
                      <span className="text-lg font-bold text-primary">{session.total_score || session.score}</span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-20 h-2 bg-secondary rounded-full overflow-hidden hidden md:block">
                          <div 
                            className="h-full bg-emerald-500" 
                            style={{ width: `${session.accuracy_percentage || session.accuracy}%` }}
                          />
                        </div>
                        <span className="font-bold">{session.accuracy_percentage || session.accuracy}%</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {session.total_time_taken || session.time}s
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <ArrowUpRight className="w-5 h-5 ml-auto text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}
