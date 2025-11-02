"use client"

import { useState, useEffect } from "react"
import { MetricsGrid } from "@/components/dashboard/metrics-grid"
import { RevenueChart } from "@/components/dashboard/revenue-chart"
import { TaskBoard } from "@/components/dashboard/task-board"
import { TeamSection } from "@/components/dashboard/team-section"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { Zap, TrendingUp, Loader2 } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

export function DashboardView() {
  const { user, loading: authLoading } = useAuth()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading dashboard data
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // Show loading state while auth is loading
  if (authLoading || isLoading) {
    return (
      <div className="p-6 lg:p-8 space-y-8 bg-gradient-to-b from-background via-background to-background/80 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  // Get user greeting
  const getUserGreeting = () => {
    if (user?.name) {
      return `Welcome back, ${user.name.split(' ')[0]}`
    }
    if (user?.email) {
      return `Welcome back, ${user.email.split('@')[0]}`
    }
    return "Welcome back"
  }

  return (
    <div className="p-6 lg:p-8 space-y-8 bg-gradient-to-b from-background via-background to-background/80">
      <div className="animate-slide-in-up">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 animate-glow-pulse">
            <Zap className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-balance text-foreground">{getUserGreeting()}</h1>
        </div>
        <p className="mt-2 text-muted-foreground leading-relaxed flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-accent" />
          Here's what's happening with your Web3 projects today.
        </p>
      </div>

      <div className="animate-slide-in-up" style={{ animationDelay: "100ms" }}>
        <MetricsGrid />
      </div>

      <div className="grid gap-8 lg:grid-cols-3 animate-slide-in-up" style={{ animationDelay: "200ms" }}>
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
        <RecentActivity />
      </div>

      <div className="animate-slide-in-up" style={{ animationDelay: "300ms" }}>
        <TaskBoard />
      </div>

      <div className="animate-slide-in-up" style={{ animationDelay: "400ms" }}>
        <TeamSection />
      </div>
    </div>
  )
}
