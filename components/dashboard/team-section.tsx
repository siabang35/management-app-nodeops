"use client"

import { MoreVertical, Mail, MessageSquare } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const team = [
  {
    id: 1,
    name: "Sarah Chen",
    role: "Moderator",
    status: "online",
    tasks: 12,
    avatar: "SC",
    color: "#3b82f6",
  },
  {
    id: 2,
    name: "Mike Johnson",
    role: "Ambassador",
    status: "online",
    tasks: 8,
    avatar: "MJ",
    color: "#10b981",
  },
  {
    id: 3,
    name: "Emma Wilson",
    role: "Ambassador",
    status: "away",
    tasks: 6,
    avatar: "EW",
    color: "#f59e0b",
  },
  {
    id: 4,
    name: "David Park",
    role: "Moderator",
    status: "offline",
    tasks: 4,
    avatar: "DP",
    color: "#8b5cf6",
  },
]

const statusColors = {
  online: "bg-accent",
  away: "bg-warning",
  offline: "bg-muted-foreground",
}

export function TeamSection() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Team Members</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {team.filter((m) => m.status === "online").length} active members
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {team.map((member) => (
          <Card key={member.id} className="p-6 hover:border-primary/50 transition-colors">
            <div className="flex items-start justify-between mb-4">
              <div className="relative">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold"
                  style={{ backgroundColor: member.color }}
                >
                  {member.avatar}
                </div>
                <div
                  className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-card ${statusColors[member.status as keyof typeof statusColors]}`}
                />
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>

            <h4 className="font-semibold text-foreground">{member.name}</h4>
            <Badge className="mt-2 mb-4">{member.role}</Badge>

            <div className="mb-4">
              <div className="text-sm text-muted-foreground">Active tasks</div>
              <div className="text-lg font-semibold text-foreground">{member.tasks}</div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1 gap-2 bg-transparent">
                <Mail className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" className="flex-1 gap-2 bg-transparent">
                <MessageSquare className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
