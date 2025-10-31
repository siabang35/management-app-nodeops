"use client"

import { TrendingUp, TrendingDown, DollarSign, Users, CheckCircle2, Activity } from "lucide-react"
import { Card } from "@/components/ui/card"

const metrics = [
  {
    label: "Total Revenue",
    value: "$124,592",
    change: "+12.5%",
    trend: "up",
    icon: DollarSign,
    gradient: "from-blue-500/20 to-cyan-500/20",
    borderColor: "border-blue-500/30",
  },
  {
    label: "Active Tasks",
    value: "48",
    change: "+8",
    trend: "up",
    icon: CheckCircle2,
    gradient: "from-emerald-500/20 to-teal-500/20",
    borderColor: "border-emerald-500/30",
  },
  {
    label: "Team Members",
    value: "24",
    change: "+3",
    trend: "up",
    icon: Users,
    gradient: "from-purple-500/20 to-pink-500/20",
    borderColor: "border-purple-500/30",
  },
  {
    label: "Network Activity",
    value: "98.4%",
    change: "+2.4%",
    trend: "up",
    icon: Activity,
    gradient: "from-orange-500/20 to-red-500/20",
    borderColor: "border-orange-500/30",
  },
]

export function MetricsGrid() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric, index) => {
        const Icon = metric.icon
        const TrendIcon = metric.trend === "up" ? TrendingUp : TrendingDown

        return (
          <Card
            key={metric.label}
            className={`p-6 relative overflow-hidden group hover-lift transition-all duration-300 ${metric.borderColor} border-2`}
            style={{
              animationDelay: `${index * 100}ms`,
            }}
          >
            <div
              className={`absolute inset-0 bg-gradient-to-br ${metric.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 animate-shimmer" />

            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`w-10 h-10 rounded-lg bg-gradient-to-br ${metric.gradient} flex items-center justify-center group-hover:animate-glow-pulse transition-all duration-300`}
                >
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div
                  className={`flex items-center gap-1 text-sm font-medium transition-all duration-300 ${
                    metric.trend === "up" ? "text-accent group-hover:text-accent/80" : "text-destructive"
                  }`}
                >
                  <TrendIcon className="w-4 h-4 animate-bounce-smooth" />
                  {metric.change}
                </div>
              </div>

              <div>
                <div className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                  {metric.value}
                </div>
                <div className="mt-1 text-sm text-muted-foreground group-hover:text-foreground/70 transition-colors duration-300">
                  {metric.label}
                </div>
              </div>

              <div className="mt-4 h-1 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-accent rounded-full animate-gradient-shift"
                  style={{
                    width: `${Math.random() * 40 + 60}%`,
                  }}
                />
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
