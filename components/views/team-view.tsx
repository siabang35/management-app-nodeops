"use client"

import { useState } from "react"
import { Plus, Mail, MessageSquare, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TeamMemberModal } from "@/components/modals/team-member-modal"
import { TeamStats } from "@/components/dashboard/team-stats"

const initialTeamMembers = [
  {
    id: 1,
    name: "Sarah Chen",
    role: "Moderator",
    email: "sarah@nodeops.io",
    status: "online",
    tasks: 12,
    avatar: "SC",
    color: "#3b82f6",
    joinDate: "2024-01-15",
    performance: 95,
  },
  {
    id: 2,
    name: "Mike Johnson",
    role: "Ambassador",
    email: "mike@nodeops.io",
    status: "online",
    tasks: 8,
    avatar: "MJ",
    color: "#10b981",
    joinDate: "2024-02-20",
    performance: 88,
  },
  {
    id: 3,
    name: "Emma Wilson",
    role: "Ambassador",
    email: "emma@nodeops.io",
    status: "away",
    tasks: 6,
    avatar: "EW",
    color: "#f59e0b",
    joinDate: "2024-03-10",
    performance: 92,
  },
  {
    id: 4,
    name: "David Park",
    role: "Moderator",
    email: "david@nodeops.io",
    status: "offline",
    tasks: 4,
    avatar: "DP",
    color: "#8b5cf6",
    joinDate: "2024-01-05",
    performance: 85,
  },
]

export function TeamView() {
  const [teamMembers, setTeamMembers] = useState(initialTeamMembers)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState<(typeof initialTeamMembers)[0] | null>(null)

  const handleAddMember = (member: any) => {
    const newMember = {
      ...member,
      id: Math.max(...teamMembers.map((m) => m.id), 0) + 1,
      avatar: member.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase(),
      color: ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"][Math.floor(Math.random() * 4)],
      tasks: 0,
      joinDate: new Date().toISOString().split("T")[0],
      performance: 0,
    }
    setTeamMembers([...teamMembers, newMember])
  }

  const handleDeleteMember = (memberId: number) => {
    setTeamMembers(teamMembers.filter((m) => m.id !== memberId))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-accent"
      case "away":
        return "bg-warning"
      default:
        return "bg-muted-foreground"
    }
  }

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Team Management</h1>
          <p className="mt-2 text-muted-foreground">Manage moderators and ambassadors</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Member
        </Button>
      </div>

      <TeamStats members={teamMembers} />

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-foreground">Team Members</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {teamMembers.map((member) => (
            <Card key={member.id} className="p-6 hover:border-primary/50 transition-colors group">
              <div className="flex items-start justify-between mb-4">
                <div className="relative">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold"
                    style={{ backgroundColor: member.color }}
                  >
                    {member.avatar}
                  </div>
                  <div
                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-card ${getStatusColor(
                      member.status,
                    )}`}
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100"
                  onClick={() => handleDeleteMember(member.id)}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>

              <h3 className="font-semibold text-foreground">{member.name}</h3>
              <Badge className="mt-2 mb-4">{member.role}</Badge>

              <div className="space-y-2 mb-4 text-sm">
                <p className="text-muted-foreground">{member.email}</p>
                <p className="text-muted-foreground">{member.tasks} active tasks</p>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Performance</span>
                  <span className="font-semibold text-primary">{member.performance}%</span>
                </div>
              </div>

              <div className="w-full bg-muted rounded-full h-2 mb-4">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${member.performance}%` }}
                />
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 gap-2 bg-transparent">
                  <Mail className="w-4 h-4" />
                  Email
                </Button>
                <Button variant="outline" size="sm" className="flex-1 gap-2 bg-transparent">
                  <MessageSquare className="w-4 h-4" />
                  Chat
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <TeamMemberModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleAddMember} />
    </div>
  )
}
