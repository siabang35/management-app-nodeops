"use client"

import { MetricsGrid } from "@/components/dashboard/metrics-grid"
import { RevenueChart } from "@/components/dashboard/revenue-chart"
import { TaskBoard } from "@/components/dashboard/task-board"
import { TeamSection } from "@/components/dashboard/team-section"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { Zap, TrendingUp } from "lucide-react"

export function DashboardView() {
  return (
    <div className="p-6 lg:p-8 space-y-8 bg-gradient-to-b from-background via-background to-background/80">
      <div className="animate-slide-in-up">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 animate-glow-pulse">
            <Zap className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-balance text-foreground">Welcome back, Alex</h1>
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
