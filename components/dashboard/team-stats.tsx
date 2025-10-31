"use client"

import { Users, TrendingUp, Award, Clock } from "lucide-react"
import { Card } from "@/components/ui/card"

interface TeamStatsProps {
  members: any[]
}

export function TeamStats({ members }: TeamStatsProps) {
  const stats = [
    {
      label: "Total Members",
      value: members.length,
      icon: Users,
      color: "#3b82f6",
    },
    {
      label: "Active Now",
      value: members.filter((m) => m.status === "online").length,
      icon: TrendingUp,
      color: "#10b981",
    },
    {
      label: "Moderators",
      value: members.filter((m) => m.role === "Moderator").length,
      icon: Award,
      color: "#f59e0b",
    },
    {
      label: "Ambassadors",
      value: members.filter((m) => m.role === "Ambassador").length,
      icon: Clock,
      color: "#8b5cf6",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.label} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${stat.color}20` }}
              >
                <Icon className="w-5 h-5" style={{ color: stat.color }} />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-foreground">{stat.value}</h3>
            <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
          </Card>
        )
      })}
    </div>
  )
}
