'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Brain, Sparkles, Loader2, ArrowRight, Mail, Lock, User, Shield, Trophy, Target } from 'lucide-react'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setIsLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ??
            `${window.location.origin}/auth/callback`,
          data: {
            display_name: displayName || email.split('@')[0],
          },
        },
      })
      if (error) throw error
      router.push('/auth/sign-up-success')
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background bg-grid-pattern relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-float delay-300" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] border border-accent/10 rounded-full animate-rotate-slow opacity-15" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md space-y-6 animate-scale-in">
        {/* Logo & Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl glass-card animate-glow-pulse mb-2">
            <Sparkles className="w-8 h-8 text-accent" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="gradient-text">Join the Challenge</span>
          </h1>
          <p className="text-muted-foreground">
            Create your account and start training
          </p>
        </div>

        {/* Sign Up Card */}
        <div className="glass-card rounded-2xl p-6 space-y-5 hover-lift">
          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName" className="text-sm font-medium flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                Display Name
              </Label>
              <Input
                id="displayName"
                type="text"
                placeholder="Your gamer tag"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="h-11 bg-secondary/50 border-border/50 focus:border-accent focus:ring-accent/20 transition-all"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 bg-secondary/50 border-border/50 focus:border-accent focus:ring-accent/20 transition-all"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium flex items-center gap-2">
                <Lock className="w-4 h-4 text-muted-foreground" />
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Min. 6 characters"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 bg-secondary/50 border-border/50 focus:border-accent focus:ring-accent/20 transition-all"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium flex items-center gap-2">
                <Shield className="w-4 h-4 text-muted-foreground" />
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Repeat your password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-11 bg-secondary/50 border-border/50 focus:border-accent focus:ring-accent/20 transition-all"
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 animate-shake">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 text-base font-semibold bg-accent hover:bg-accent/90 text-accent-foreground glow-accent transition-all group"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </form>

          <div className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-primary hover:text-primary/80 font-medium underline-offset-4 hover:underline transition-colors">
              Sign in
            </Link>
          </div>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          {[
            { icon: Trophy, label: 'Compete globally', desc: 'Leaderboards' },
            { icon: Target, label: 'Track progress', desc: 'Statistics' },
          ].map((benefit, i) => (
            <div
              key={benefit.label}
              className="flex items-center gap-3 p-3 rounded-xl glass opacity-0 animate-slide-up"
              style={{ animationDelay: `${(i + 1) * 150}ms`, animationFillMode: 'forwards' }}
            >
              <div className="p-2 rounded-lg bg-primary/10">
                <benefit.icon className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">{benefit.label}</p>
                <p className="text-xs text-muted-foreground">{benefit.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
