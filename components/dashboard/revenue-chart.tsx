"use client"

import { BarChart3, TrendingUp } from "lucide-react"
import { Card } from "@/components/ui/card"

interface RevenueChartProps {
  expanded?: boolean
}

const data = [
  { month: "Jan", value: 65 },
  { month: "Feb", value: 78 },
  { month: "Mar", value: 82 },
  { month: "Apr", value: 71 },
  { month: "May", value: 88 },
  { month: "Jun", value: 95 },
]

export function RevenueChart({ expanded = false }: RevenueChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value))

  return (
    <Card className="p-6 glass-effect hover:glass-effect-dark transition-all duration-300 group">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/50">
        <div className="animate-slide-in-left">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 group-hover:animate-glow-pulse">
              <BarChart3 className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Revenue Overview</h3>
          </div>
          <p className="mt-1 text-sm text-muted-foreground flex items-center gap-1">
            <TrendingUp className="w-4 h-4 text-accent" />
            Monthly revenue trends for 2024
          </p>
        </div>
      </div>

      <div className="flex items-end justify-between gap-4" style={{ height: expanded ? "400px" : "200px" }}>
        {data.map((item, index) => (
          <div
            key={item.month}
            className="flex flex-1 flex-col items-center gap-3 group/bar"
            style={{
              animationDelay: `${index * 50}ms`,
            }}
          >
            <div className="relative w-full h-full flex items-end justify-center">
              <div className="absolute inset-0 rounded-t-lg bg-gradient-to-t from-primary/20 to-transparent opacity-0 group-hover/bar:opacity-100 transition-opacity duration-300" />
              <div
                className="w-full rounded-t-lg bg-gradient-to-t from-primary to-cyan-500 transition-all duration-500 hover:shadow-lg hover:shadow-primary/50 group-hover/bar:animate-glow-pulse relative"
                style={{
                  height: `${(item.value / maxValue) * (expanded ? 360 : 160)}px`,
                }}
              >
                <div className="absolute inset-0 rounded-t-lg bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer opacity-0 group-hover/bar:opacity-100" />
              </div>
            </div>
            <div className="text-xs font-medium text-muted-foreground group-hover/bar:text-foreground transition-colors duration-300">
              {item.month}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-gradient-to-r from-transparent via-border to-transparent pt-6">
        <div className="animate-slide-in-left">
          <div className="text-sm text-muted-foreground">Total Revenue</div>
          <div className="mt-1 font-mono text-2xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">
            $124,592
          </div>
        </div>
        <div className="h-12 w-px bg-gradient-to-b from-transparent via-border to-transparent" />
        <div className="animate-slide-in-right text-right">
          <div className="text-sm text-muted-foreground">Growth Rate</div>
          <div className="mt-1 font-mono text-2xl font-bold text-accent flex items-center gap-1 justify-end">
            <TrendingUp className="w-5 h-5" />
            +12.5%
          </div>
        </div>
      </div>
    </Card>
  )
}
