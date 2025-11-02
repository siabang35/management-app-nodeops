"use client"

import { useState, useEffect } from "react"
import { Plus, Mail, MessageSquare, Trash2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TeamMemberModal } from "@/components/modals/team-member-modal"
import { TeamStats } from "@/components/dashboard/team-stats"
import { getTeamMembers, addTeamMember, deleteTeamMember, getTeamStats } from "@/app/actions/team"
import { useToast } from "@/hooks/use-toast"

export function TeamView() {
  const [teamMembers, setTeamMembers] = useState<any[]>([])
  const [teamStats, setTeamStats] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  // Load team data on component mount
  useEffect(() => {
    loadTeamData()
  }, [])

  const loadTeamData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Load team members
      const membersResult = await getTeamMembers() as { error?: string; data?: any[] }
      if (membersResult.error) {
        console.error("Failed to load team members:", membersResult.error)
        setError("Failed to load team members")
        toast({
          title: "Error loading team members",
          description: membersResult.error,
          variant: "destructive",
        })
      } else {
        setTeamMembers(membersResult.data || [])
      }

      // Load team stats
      const statsResult = await getTeamStats() as { error?: string; data?: any }
      if (statsResult.error) {
        console.error("Failed to load team stats:", statsResult.error)
      } else {
        setTeamStats(statsResult.data)
      }
    } catch (err: any) {
      console.error("Error loading team data:", err)
      setError("Failed to load team data")
      toast({
        title: "Error loading team data",
        description: err.message || "Unknown error",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddMember = async (member: any) => {
    try {
      const result = await addTeamMember({
        ...member,
        joined_at: new Date().toISOString(),
        status: "active",
      });

      const typedResult = result as { error?: string; data?: any };

      if (typedResult.error) {
        throw new Error(typedResult.error)
      }

      // Reload team data to show the new member
      await loadTeamData()

      toast({
        title: "Team member added",
        description: "New team member has been added successfully.",
      })

      setIsModalOpen(false)
    } catch (err: any) {
      console.error("Failed to add team member:", err)
      toast({
        title: "Failed to add team member",
        description: err.message || "Unknown error",
        variant: "destructive",
      })
    }
  }

  const handleDeleteMember = async (memberId: string) => {
    try {
      const result = await deleteTeamMember(memberId)
      const typedResult = result as { error?: string; data?: any }
      if (typedResult.error) {
        throw new Error(typedResult.error)
      }

      // Reload team data to reflect the deletion
      await loadTeamData()

      toast({
        title: "Team member removed",
        description: "Team member has been removed successfully.",
      })
    } catch (err: any) {
      console.error("Failed to delete team member:", err)
      toast({
        title: "Failed to remove team member",
        description: err.message || "Unknown error",
        variant: "destructive",
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
      case "active":
        return "bg-accent"
      case "away":
        return "bg-warning"
      default:
        return "bg-muted-foreground"
    }
  }

  const getMemberAvatar = (member: any) => {
    if (member.name) {
      return member.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
    }
    return "??"
  }

  const getMemberColor = (member: any) => {
    const colors = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#8b5cf6"]
    // Use a simple hash of the member ID or name for consistent colors
    const hash = member.id || member.name || ""
    return colors[Math.abs(hash.split("").reduce((a: any, b: string) => a + b.charCodeAt(0), 0)) % colors.length]
  }

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 space-y-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading team data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 lg:p-8 space-y-8">
        <div className="text-center py-12">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={loadTeamData} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    )
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

      <TeamStats members={teamMembers} stats={teamStats} />

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-foreground">Team Members</h2>
        {teamMembers.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No team members found. Add your first team member to get started.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {teamMembers.map((member) => (
              <Card key={member.id} className="p-6 hover:border-primary/50 transition-colors group">
                <div className="flex items-start justify-between mb-4">
                  <div className="relative">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold"
                      style={{ backgroundColor: getMemberColor(member) }}
                    >
                      {getMemberAvatar(member)}
                    </div>
                    <div
                      className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-card ${getStatusColor(
                        member.status || "offline",
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

                <h3 className="font-semibold text-foreground">{member.name || "Unknown"}</h3>
                <Badge className="mt-2 mb-4">{member.role || "Member"}</Badge>

                <div className="space-y-2 mb-4 text-sm">
                  <p className="text-muted-foreground">{member.email || "No email"}</p>
                  <p className="text-muted-foreground">{member.tasks_assigned || 0} active tasks</p>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Performance</span>
                    <span className="font-semibold text-primary">{member.performance || 0}%</span>
                  </div>
                </div>

                <div className="w-full bg-muted rounded-full h-2 mb-4">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${member.performance || 0}%` }}
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
        )}
      </div>

      <TeamMemberModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleAddMember} />
    </div>
  )
}
