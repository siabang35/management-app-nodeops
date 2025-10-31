"use client"

import { Card } from "@/components/ui/card"
import { TrendingUp, Award, Zap, Target } from "lucide-react"

interface PerformanceMetricsProps {
  teamMembers?: any[]
}

export function PerformanceMetrics({ teamMembers = [] }: PerformanceMetricsProps) {
  const metrics = [
    {
      label: "Avg Task Completion",
      value: "4.2 days",
      change: "-0.5 days",
      trend: "up",
      icon: Zap,
    },
    {
      label: "Team Productivity",
      value: "92%",
      change: "+5%",
      trend: "up",
      icon: TrendingUp,
    },
    {
      label: "On-Time Delivery",
      value: "88%",
      change: "+3%",
      trend: "up",
      icon: Target,
    },
    {
      label: "Quality Score",
      value: "9.2/10",
      change: "+0.3",
      trend: "up",
      icon: Award,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Performance Metrics</h2>
        <p className="text-sm text-muted-foreground mt-1">Key performance indicators</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon
          return (
            <Card key={metric.label} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <span className="text-xs font-medium text-accent">{metric.change}</span>
              </div>
              <h3 className="text-2xl font-bold text-foreground">{metric.value}</h3>
              <p className="text-sm text-muted-foreground mt-1">{metric.label}</p>
            </Card>
          )
        })}
      </div>

      {teamMembers.length > 0 && (
        <Card className="p-6">
          <h3 className="font-semibold text-foreground mb-4">Top Performers</h3>
          <div className="space-y-3">
            {teamMembers
              .sort((a, b) => (b.performance || 0) - (a.performance || 0))
              .slice(0, 5)
              .map((member, index) => (
                <div key={member.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-semibold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.role}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-primary">{member.performance || 0}%</p>
                    <p className="text-xs text-muted-foreground">{member.tasks} tasks</p>
                  </div>
                </div>
              ))}
          </div>
        </Card>
      )}
    </div>
  )
}
