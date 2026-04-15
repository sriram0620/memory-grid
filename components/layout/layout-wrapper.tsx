'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { Sidebar } from './sidebar'
import { cn } from '@/lib/utils'
import { useGame } from '@/lib/game-context'

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { state } = useGame()
  
  const isHome = pathname === '/'
  const isAuth = pathname.startsWith('/auth')
  const isPlaying = pathname.startsWith('/play') && state.phase !== 'setup'
  
  const showSidebar = !isHome && !isAuth && !isPlaying

  return (
    <div className="flex min-h-screen">
      {showSidebar && <Sidebar />}
      <main className={cn(
        "flex-1 transition-all duration-300",
        showSidebar ? "pl-60" : "pl-0"
      )}>
        {children}
      </main>
    </div>
  )
}
