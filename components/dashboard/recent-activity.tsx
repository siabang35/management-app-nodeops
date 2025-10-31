"use client"

import { Clock, GitCommit, CheckCircle2, AlertCircle } from "lucide-react"
import { Card } from "@/components/ui/card"

const activities = [
  {
    type: "task",
    title: "Smart contract deployed",
    time: "2 hours ago",
    icon: CheckCircle2,
    color: "text-accent",
  },
  {
    type: "commit",
    title: "New commit to main branch",
    time: "4 hours ago",
    icon: GitCommit,
    color: "text-primary",
  },
  {
    type: "alert",
    title: "High gas fees detected",
    time: "6 hours ago",
    icon: AlertCircle,
    color: "text-destructive",
  },
  {
    type: "task",
    title: "UI design review completed",
    time: "8 hours ago",
    icon: CheckCircle2,
    color: "text-accent",
  },
]

export function RecentActivity() {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Recent Activity</h3>
          <p className="text-sm text-muted-foreground mt-1">Latest updates</p>
        </div>
        <Clock className="w-5 h-5 text-muted-foreground" />
      </div>

      <div className="space-y-4">
        {activities.map((activity, index) => {
          const Icon = activity.icon
          return (
            <div key={index} className="flex items-start gap-3">
              <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${activity.color}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground leading-relaxed">{activity.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
