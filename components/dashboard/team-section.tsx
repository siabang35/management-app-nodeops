"use client"

import { useState, useEffect } from "react"
import { MoreVertical, Mail, MessageSquare, Loader2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getTeamMembers } from "@/app/actions/team"
import { useToast } from "@/hooks/use-toast"

interface TeamMember {
  id: string
  name: string
  role: string
  status?: string
  tasks?: number
  avatar?: string
  color?: string
  joined_at?: string
}

export function TeamSection() {
  const [team, setTeam] = useState<TeamMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  // Load team members on component mount
  useEffect(() => {
    loadTeamMembers()
  }, [])

  const loadTeamMembers = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const result = await getTeamMembers() as { error?: string; data?: any[] }
      if (result.error) {
        console.error("Failed to load team members:", result.error)
        setError("Failed to load team members")
        toast({
          title: "Error loading team members",
          description: result.error,
          variant: "destructive",
        })
        // Fallback to empty team
        setTeam([])
      } else {
        // Transform backend data to match component expectations
        const members = (result.data || []).map((member: any, index: number) => ({
          id: member.id || `member-${index}`,
          name: member.name || member.full_name || "Unknown Member",
          role: member.role || "member",
          status: member.status || "offline",
          tasks: member.tasks || 0,
          avatar: member.avatar || member.name?.slice(0, 2).toUpperCase() || "UM",
          color: member.color || getRandomColor(),
          joined_at: member.joined_at,
        }))
        setTeam(members)
      }
    } catch (err: any) {
      console.error("Error loading team members:", err)
      setError("Failed to load team members")
      toast({
        title: "Error loading team members",
        description: err.message || "Unknown error",
        variant: "destructive",
      })
      setTeam([])
    } finally {
      setIsLoading(false)
    }
  }

  const getRandomColor = () => {
    const colors = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4"]
    return colors[Math.floor(Math.random() * colors.length)]
  }

  const statusColors = {
    online: "bg-accent",
    away: "bg-warning",
    offline: "bg-muted-foreground",
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Team Members</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Loading team members...
          </p>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Loading team...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Team Members</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {team.filter((m) => m.status === "online").length} active members
          </p>
        </div>
        <div className="text-center py-12">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={loadTeamMembers} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Team Members</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {team.filter((m) => m.status === "online").length} active members
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {team.length > 0 ? (
          team.map((member) => (
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
                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-card ${
                      statusColors[member.status as keyof typeof statusColors] || statusColors.offline
                    }`}
                  />
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>

              <h4 className="font-semibold text-foreground">{member.name}</h4>
              <Badge className="mt-2 mb-4 capitalize">{member.role}</Badge>

              <div className="mb-4">
                <div className="text-sm text-muted-foreground">Active tasks</div>
                <div className="text-lg font-semibold text-foreground">{member.tasks || 0}</div>
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
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground mb-4">No team members found</p>
            <Button variant="outline" onClick={loadTeamMembers}>
              Refresh
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
