"use client"

import { Card } from "@/components/ui/card"
import { getRelativeTime } from "@/lib/utils"
import { CheckCircle2, Edit3, Trash2, Users, MessageSquare, Share2 } from "lucide-react"

interface Activity {
  id: string
  type: "create" | "update" | "delete" | "comment" | "share" | "assign"
  user: string
  action: string
  target: string
  timestamp: string
  avatar?: string
}

interface ActivityFeedProps {
  activities?: Activity[]
}

export function ActivityFeed({ activities = [] }: ActivityFeedProps) {
  const defaultActivities: Activity[] = [
    {
      id: "1",
      type: "create",
      user: "Sarah Chen",
      action: "created",
      target: "Update smart contract documentation",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      avatar: "SC",
    },
    {
      id: "2",
      type: "update",
      user: "Mike Johnson",
      action: "updated",
      target: "Review Q1 revenue reports",
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      avatar: "MJ",
    },
    {
      id: "3",
      type: "comment",
      user: "Emma Wilson",
      action: "commented on",
      target: "Onboard new ambassador team",
      timestamp: new Date(Date.now() - 10800000).toISOString(),
      avatar: "EW",
    },
    {
      id: "4",
      type: "assign",
      user: "David Park",
      action: "assigned",
      target: "Deploy testnet updates",
      timestamp: new Date(Date.now() - 14400000).toISOString(),
      avatar: "DP",
    },
  ]

  const displayActivities = activities.length > 0 ? activities : defaultActivities

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "create":
        return <CheckCircle2 className="w-4 h-4 text-accent" />
      case "update":
        return <Edit3 className="w-4 h-4 text-primary" />
      case "delete":
        return <Trash2 className="w-4 h-4 text-destructive" />
      case "comment":
        return <MessageSquare className="w-4 h-4 text-primary" />
      case "share":
        return <Share2 className="w-4 h-4 text-primary" />
      case "assign":
        return <Users className="w-4 h-4 text-primary" />
      default:
        return <CheckCircle2 className="w-4 h-4" />
    }
  }

  return (
    <Card className="p-6">
      <h3 className="font-semibold text-foreground mb-4">Recent Activity</h3>
      <div className="space-y-4">
        {displayActivities.map((activity) => (
          <div key={activity.id} className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              {getActivityIcon(activity.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground">
                <span className="font-semibold">{activity.user}</span>{" "}
                <span className="text-muted-foreground">{activity.action}</span>{" "}
                <span className="font-medium">{activity.target}</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">{getRelativeTime(activity.timestamp)}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
