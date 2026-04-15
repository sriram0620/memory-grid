'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Brain, Sparkles, Trophy, Zap, Target, Clock, Grid3X3, ArrowRight, Play, Star } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background bg-grid-pattern relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-1/4 w-[400px] h-[400px] bg-accent/10 rounded-full blur-3xl animate-float delay-500" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] border border-primary/5 rounded-full animate-rotate-slow" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] border border-accent/5 rounded-full animate-rotate-slow" style={{ animationDirection: 'reverse', animationDuration: '25s' }} />
      </div>

      {/* Sidebar will handle navigation */}

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32">
        <div className="text-center space-y-8 animate-slide-up">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-sm font-medium animate-glow-pulse">
            <Sparkles className="w-4 h-4 text-accent" />
            <span>Challenge Your Mind</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight max-w-4xl mx-auto leading-tight">
            <span className="text-foreground">Train Your</span>
            <br />
            <span className="gradient-text-animated">Memory Skills</span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            A premium cognitive challenge that tests observation, recall, and pattern recognition. 
            Compete globally and track your progress.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/auth/sign-up">
              <Button size="lg" className="h-14 px-8 text-lg font-semibold bg-primary hover:bg-primary/90 glow-primary group">
                <Play className="w-5 h-5 mr-2" />
                Start Playing Free
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg border-border/50 hover:border-primary/50 hover:bg-primary/5">
                <Trophy className="w-5 h-5 mr-2 text-warning" />
                View Leaderboard
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-8 pt-8">
            {[
              { value: '10K+', label: 'Players' },
              { value: '50K+', label: 'Games Played' },
              { value: '4.9', label: 'Rating', icon: Star },
            ].map((stat, i) => (
              <div
                key={stat.label}
                className="text-center opacity-0 animate-slide-up"
                style={{ animationDelay: `${(i + 3) * 100}ms`, animationFillMode: 'forwards' }}
              >
                <div className="flex items-center justify-center gap-1">
                  <span className="text-2xl font-bold text-foreground">{stat.value}</span>
                  {stat.icon && <stat.icon className="w-4 h-4 text-warning fill-warning" />}
                </div>
                <span className="text-sm text-muted-foreground">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-32">
          {[
            {
              icon: Grid3X3,
              title: 'Grid Challenge',
              description: 'Memorize and reconstruct complex grid patterns',
              color: 'text-primary',
              bg: 'bg-primary/10',
            },
            {
              icon: Clock,
              title: 'Time Attack',
              description: 'Race against the clock for bonus points',
              color: 'text-accent',
              bg: 'bg-accent/10',
            },
            {
              icon: Target,
              title: 'Precision Quiz',
              description: 'Test your recall with challenging questions',
              color: 'text-success',
              bg: 'bg-success/10',
            },
            {
              icon: Zap,
              title: 'Sequence Match',
              description: 'Follow and repeat dynamic patterns',
              color: 'text-warning',
              bg: 'bg-warning/10',
            },
          ].map((feature, i) => (
            <div
              key={feature.title}
              className="glass-card rounded-2xl p-6 space-y-4 hover-lift opacity-0 animate-slide-up"
              style={{ animationDelay: `${(i + 5) * 100}ms`, animationFillMode: 'forwards' }}
            >
              <div className={`p-3 rounded-xl ${feature.bg} w-fit`}>
                <feature.icon className={`w-6 h-6 ${feature.color}`} />
              </div>
              <h3 className="text-lg font-semibold">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* How It Works */}
        <div className="mt-32 text-center">
          <h2 className="text-3xl font-bold mb-4">How It Works</h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-12">
            Four phases designed to challenge your cognitive abilities
          </p>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: '01', title: 'Observe', desc: 'Study the grid pattern carefully' },
              { step: '02', title: 'Recall', desc: 'Reconstruct what you remember' },
              { step: '03', title: 'Quiz', desc: 'Answer questions about the grid' },
              { step: '04', title: 'Sequence', desc: 'Match the pattern sequence' },
            ].map((phase, i) => (
              <div
                key={phase.step}
                className="relative opacity-0 animate-slide-up"
                style={{ animationDelay: `${(i + 9) * 100}ms`, animationFillMode: 'forwards' }}
              >
                {i < 3 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-px bg-gradient-to-r from-border to-transparent" />
                )}
                <div className="glass rounded-xl p-6 space-y-3">
                  <span className="text-4xl font-bold gradient-text">{phase.step}</span>
                  <h3 className="font-semibold">{phase.title}</h3>
                  <p className="text-sm text-muted-foreground">{phase.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <div className="mt-32 text-center glass-card rounded-3xl p-12 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Ready to Challenge Yourself?</h2>
          <p className="text-muted-foreground mb-8">
            Join thousands of players improving their memory every day
          </p>
          <Link href="/auth/sign-up">
            <Button size="lg" className="h-14 px-10 text-lg font-semibold bg-accent hover:bg-accent/90 text-accent-foreground glow-accent group">
              <Brain className="w-5 h-5 mr-2" />
              Start Your Journey
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/50 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            <span className="text-sm text-muted-foreground">Memory Grid Challenge</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Built with Next.js and Supabase
          </p>
        </div>
      </footer>
    </div>
  )
}
