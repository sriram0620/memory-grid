'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Mail, CheckCircle, ArrowRight, Sparkles } from 'lucide-react'

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background bg-grid-pattern relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-success/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-float delay-500" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md text-center space-y-8 animate-scale-in">
        {/* Success Icon */}
        <div className="relative inline-flex">
          <div className="absolute inset-0 bg-success/20 rounded-full animate-pulse-ring" />
          <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-full glass-card glow-success">
            <CheckCircle className="w-12 h-12 text-success animate-success-pop" />
          </div>
        </div>

        {/* Message */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="gradient-text">Check Your Email</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-sm mx-auto">
            We&apos;ve sent you a confirmation link. Click it to activate your account and start playing.
          </p>
        </div>

        {/* Email Icon Card */}
        <div className="glass-card rounded-2xl p-6 space-y-4 hover-lift mx-auto max-w-xs">
          <div className="p-4 rounded-xl bg-primary/10 inline-flex">
            <Mail className="w-8 h-8 text-primary animate-bounce-subtle" />
          </div>
          <p className="text-sm text-muted-foreground">
            The link will expire in 24 hours
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-3 pt-4">
          <Link href="/auth/login">
            <Button className="w-full max-w-xs h-12 text-base font-semibold bg-primary hover:bg-primary/90 glow-primary transition-all group">
              <Sparkles className="w-5 h-5 mr-2" />
              Go to Login
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <p className="text-xs text-muted-foreground">
            Didn&apos;t receive the email? Check your spam folder.
          </p>
        </div>
      </div>
    </div>
  )
}
