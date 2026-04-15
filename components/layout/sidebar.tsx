'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home, 
  TrendingUp, 
  LogOut, 
  User, 
  Brain,
  LayoutDashboard,
  Trophy,
  Play
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  
  // Sidebar visibility is now controlled by LayoutWrapper

  const navItems = [
    { name: 'Home', icon: Home, href: '/' },
    { name: 'Performance', icon: TrendingUp, href: '/performance' },
    { name: 'Leaderboard', icon: Trophy, href: '/leaderboard' },
  ]

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <aside className={cn(
      "fixed left-0 top-0 bottom-0 w-60 glass-sidebar border-r border-white/5 z-50 flex flex-col",
      className
    )}>
      {/* Logo Section */}
      <div className="p-4 py-6 border-b border-border/10">
        <Link href="/" className="flex items-center gap-3 group px-2">
          <div className="p-1.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-all duration-300">
            <Brain className="w-5 h-5 text-primary" />
          </div>
          <span className="font-black text-lg tracking-tight gradient-text">Memory Grid</span>
        </Link>
      </div>

      {/* Play Now Call to Action */}
      <div className="px-3 pt-4">
        <Link
          href="/play"
          className={cn(
            "flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl transition-all duration-500 group relative overflow-hidden bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-[0.2em] text-[10px] shadow-lg shadow-primary/20 hover:shadow-primary/40 active:scale-95",
            pathname === '/play' ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""
          )}
        >
          <Play className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" />
          <span>Play Now</span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
        </Link>
      </div>

      {/* Navigation Section */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 mt-2">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex items-center gap-3.5 px-4 py-2.5 rounded-xl transition-all duration-500 group relative overflow-hidden",
              pathname === item.href 
                ? "bg-primary/10 text-primary shadow-sm" 
                : "text-muted-foreground hover:bg-white/5 hover:text-foreground hover:translate-x-1"
            )}
          >
            {pathname === item.href && (
              <span className="absolute left-0 top-2 bottom-2 w-1 bg-primary rounded-r-full" />
            )}
            <item.icon className={cn(
              "w-4 h-4 transition-all duration-300 group-hover:scale-110",
              pathname === item.href ? "text-primary" : "text-muted-foreground"
            )} />
            <span className="font-bold text-[13px] tracking-tight">{item.name}</span>
          </Link>
        ))}
      </nav>

      {/* User & Footer Section */}
      <div className="p-3 border-t border-border/10">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-white/5 glass-card mb-3">
          <div className="p-1.5 rounded-full bg-accent/20">
            <User className="w-3 h-3 text-accent" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest leading-none mb-1">User</span>
            <span className="text-[11px] font-black truncate text-foreground">suryasriramamurthy2003@gmail.com</span>
          </div>
        </div>
        
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-300 group text-[13px]"
        >
          <LogOut className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          <span className="font-bold">Sign Out</span>
        </button>
      </div>
    </aside>
  )
}
