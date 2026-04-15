'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react'

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background bg-grid-pattern relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-destructive/10 rounded-full blur-3xl animate-float" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md text-center space-y-8 animate-scale-in">
        {/* Error Icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full glass-card">
          <AlertTriangle className="w-10 h-10 text-destructive animate-bounce-subtle" />
        </div>

        {/* Message */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Authentication Error
          </h1>
          <p className="text-muted-foreground max-w-sm mx-auto">
            Something went wrong during authentication. This could be an expired link or a temporary issue.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Link href="/auth/login">
            <Button variant="outline" className="w-full sm:w-auto h-11 gap-2 border-border/50 hover:border-primary/50">
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </Button>
          </Link>
          <Button
            onClick={() => window.location.reload()}
            className="w-full sm:w-auto h-11 gap-2 bg-primary hover:bg-primary/90"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
        </div>
      </div>
    </div>
  )
}
