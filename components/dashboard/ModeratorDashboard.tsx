"use client"

import React, { useEffect, useState, useMemo, useRef } from "react"
import { useAuth } from "@/lib/auth-context"
import { getTopAmbassadors, updateAmbassadorPoints, subscribeToMindshareUpdates } from "@/lib/supabase"
import { cn } from "@/lib/utils"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import {
  Shield,
  Users,
  TrendingUp,
  Edit,
  Search,
  Crown,
  CheckSquare,
  UserCheck,
  PieChart,
  ClipboardList,
  Zap,
  LogOut,
  Bell,
  Home,
  UserPlus,
  Download,
  Upload,
  RefreshCw,
  Eye,
  Target,
  ChevronDown,
  ChevronUp,
  Settings
} from "lucide-react"
import { toast } from "sonner"

// Import dashboard components
import { ActivityFeed } from './activity-feed'
import { TaskBoard } from './task-board'
import { TeamSection } from './team-section'
import { AnalyticsCharts } from './analytics-charts'
import { RevenueChart } from './revenue-chart'
import { ReportGenerator } from './report-generator'

interface Ambassador {
  id: string
  user_id: string
  wallet_address: string
  email: string
  twitter_handle?: string
  telegram_handle?: string
  discord_handle?: string
  points: number
  mindshare_score: number
  tasks_completed: number
  created_at: string
  updated_at: string
  rank?: number
  status?: 'active' | 'inactive' | 'suspended'
}



const ModeratorDashboard: React.FC = () => {
  const { user, isModerator, signOut } = useAuth()
  const [ambassadors, setAmbassadors] = useState<Ambassador[]>([])
  const [filteredAmbassadors, setFilteredAmbassadors] = useState<Ambassador[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedAmbassador, setSelectedAmbassador] = useState<Ambassador | null>(null)
  const [pointsAdjustment, setPointsAdjustment] = useState("")
  const [adjustmentReason, setAdjustmentReason] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [activeView, setActiveView] = useState('dashboard')
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("points")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const subscriptionRef = useRef<any>(null)

  // Sidebar navigation items
  const navigationItems = [
    { name: "Dashboard", icon: Home, id: "dashboard" },
    { name: "Ambassadors", icon: Crown, id: "ambassadors" },
    { name: "Team", icon: UserCheck, id: "team" },
    { name: "Tasks", icon: CheckSquare, id: "tasks" },
    { name: "Analytics", icon: PieChart, id: "analytics" },
    { name: "Reports", icon: ClipboardList, id: "reports" },
    { name: "Settings", icon: Settings, id: "settings" },
  ]

  // Memoized statistics
  const stats = useMemo(() => {
    const totalAmbassadors = ambassadors.length
    const activeAmbassadors = ambassadors.filter((amb) => amb.status === 'active').length
    const totalPoints = ambassadors.reduce((sum, amb) => sum + amb.points, 0)
    const avgMindshare =
      totalAmbassadors > 0 ? ambassadors.reduce((sum, amb) => sum + amb.mindshare_score, 0) / totalAmbassadors : 0
    const totalTasks = ambassadors.reduce((sum, amb) => sum + amb.tasks_completed, 0)

    return { totalAmbassadors, activeAmbassadors, totalPoints, avgMindshare, totalTasks }
  }, [ambassadors])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getTopAmbassadors(1000) // Get more for moderation
        setAmbassadors(data)
        setFilteredAmbassadors(data)
      } catch (error) {
        console.error("Error fetching ambassadors:", error)
        toast.error("Failed to load ambassador data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    // Subscribe to real-time updates
    try {
      subscriptionRef.current = subscribeToMindshareUpdates((payload) => {
        console.log("Mindshare update:", payload)
        fetchData() // Refresh data on updates
      })
    } catch (error) {
      console.error("Error subscribing to updates:", error)
    }

    return () => {
      if (subscriptionRef.current?.unsubscribe) {
        subscriptionRef.current.unsubscribe()
      }
    }
  }, [])

  // Filter and sort ambassadors
  useEffect(() => {
    let filtered = ambassadors.filter(
      (amb) =>
        (amb.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        amb.wallet_address.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (filterStatus === "all" || amb.status === filterStatus)
    )

    // Sort ambassadors
    filtered.sort((a, b) => {
      let aValue: any, bValue: any

      switch (sortBy) {
        case "points":
          aValue = a.points
          bValue = b.points
          break
        case "mindshare":
          aValue = a.mindshare_score
          bValue = b.mindshare_score
          break
        case "tasks":
          aValue = a.tasks_completed
          bValue = b.tasks_completed
          break
        case "email":
          aValue = a.email.toLowerCase()
          bValue = b.email.toLowerCase()
          break
        default:
          aValue = a.points
          bValue = b.points
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    setFilteredAmbassadors(filtered)
  }, [ambassadors, searchTerm, filterStatus, sortBy, sortOrder])

  const handlePointsAdjustment = async () => {
    if (!selectedAmbassador || !pointsAdjustment) return

    try {
      const newPoints = selectedAmbassador.points + Number.parseInt(pointsAdjustment)
      const success = await updateAmbassadorPoints(selectedAmbassador.id, newPoints)

      if (success) {
        toast.success(`Points updated successfully. New total: ${newPoints}`)
        setDialogOpen(false)
        setSelectedAmbassador(null)
        setPointsAdjustment("")
        setAdjustmentReason("")

        // Refresh data
        const data = await getTopAmbassadors(1000)
        setAmbassadors(data)
      } else {
        toast.error("Failed to update points")
      }
    } catch (error) {
      console.error("Error updating points:", error)
      toast.error("An error occurred while updating points")
    }
  }



  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open)
    if (!open) {
      setSelectedAmbassador(null)
      setPointsAdjustment("")
      setAdjustmentReason("")
    }
  }

  const handleLogout = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  if (!isModerator) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <p className="text-sm text-muted-foreground">You need moderator privileges to access this dashboard.</p>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary animate-glow-pulse"></div>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <Sidebar className="border-r border-border/50 bg-gradient-to-b from-card via-card to-card/80 backdrop-blur-xl">
          <SidebarHeader className="border-b border-border/50 px-6 py-4 bg-gradient-to-r from-primary/10 via-transparent to-accent/10">
            <div className="flex items-center gap-3 group">
              <div className="w-10 h-10 relative animate-rotate-in">
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-lg opacity-0 group-hover:opacity-100 blur transition-opacity duration-300" />
                <Zap className="w-10 h-10 relative z-10 text-primary" />
              </div>
              <div>
                <h1 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors duration-300">
                  NodeOps
                </h1>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Shield className="w-3 h-3 text-accent" />
                  Moderator
                </p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent className="px-4 py-4">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Management
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item, index) => {
                    const Icon = item.icon
                    const isActive = activeView === item.id

                    return (
                      <SidebarMenuItem key={item.id}>
                        <SidebarMenuButton
                          onClick={() => setActiveView(item.id)}
                          isActive={isActive}
                          className={cn(
                            "w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-300 group relative overflow-hidden",
                            isActive
                              ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/50 neon-border"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                          )}
                          style={{
                            animationDelay: `${index * 50}ms`,
                          }}
                        >
                          {isActive && (
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 animate-gradient-shift" />
                          )}
                          <Icon
                            className={cn(
                              "w-5 h-5 flex-shrink-0 relative z-10 transition-all duration-300",
                              isActive && "group-hover:scale-110 animate-glow-pulse",
                            )}
                          />
                          <span className="relative z-10">{item.name}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-border/50 p-4 bg-gradient-to-t from-primary/5 to-transparent">
            <div className="glass-effect rounded-lg p-3 hover-lift animate-slide-in-up">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center flex-shrink-0 animate-glow-pulse">
                  <span className="text-primary-foreground font-semibold text-sm">
                    {user?.email?.slice(0, 2).toUpperCase() || 'MO'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-sm truncate">
                    {user?.email?.split('@')[0] || 'Moderator'}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    Admin Access
                  </p>
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="w-full gap-2 bg-transparent hover:bg-muted/50 hover:neon-border transition-all duration-300 mt-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>

        <SidebarInset className="flex-1 overflow-auto">
          <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-md">
            <div className="flex h-16 items-center gap-4 px-6">
              <SidebarTrigger className="md:hidden" />
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold text-foreground">
                  {navigationItems.find(item => item.id === activeView)?.name || 'Dashboard'}
                </h2>
                <Badge variant="secondary" className="text-sm">
                  <Shield className="w-4 h-4 mr-1" />
                  Moderator
                </Badge>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-2">
                  <Bell className="w-4 h-4" />
                  Notifications
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </Button>
              </div>
            </div>
          </header>

          <main className="flex-1 p-6 space-y-6">
            {activeView === 'dashboard' && (
              <div className="space-y-6">
                {/* Key Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card className="hover-lift transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Ambassadors</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.totalAmbassadors}</div>
                      <p className="text-xs text-muted-foreground">
                        {stats.activeAmbassadors} active
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="hover-lift transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Points</CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.totalPoints.toLocaleString()}</div>
                      <p className="text-xs text-muted-foreground">
                        Across all ambassadors
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="hover-lift transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Avg Mindshare</CardTitle>
                      <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.avgMindshare.toFixed(1)}</div>
                      <p className="text-xs text-muted-foreground">
                        Performance score
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="hover-lift transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
                      <CheckSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.totalTasks}</div>
                      <p className="text-xs text-muted-foreground">
                        Completed by ambassadors
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Activity Feed and Quick Stats */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <ActivityFeed />
                  </div>
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <div className="text-lg font-semibold">Quick Actions</div>
                        <p className="text-sm text-muted-foreground">Common management tasks</p>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <Button className="w-full gap-2" variant="outline">
                          <UserPlus className="w-4 h-4" />
                          Add New Ambassador
                        </Button>
                        <Button className="w-full gap-2" variant="outline">
                          <Download className="w-4 h-4" />
                          Export Data
                        </Button>
                        <Button className="w-full gap-2" variant="outline">
                          <Upload className="w-4 h-4" />
                          Import Data
                        </Button>
                        <Button className="w-full gap-2" variant="outline">
                          <Settings className="w-4 h-4" />
                          System Settings
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            )}

            {activeView === 'ambassadors' && (
              <div className="space-y-6">
                {/* Filters and Search */}
                <Card>
                  <CardHeader>
                    <CardTitle>Ambassador Management</CardTitle>
                    <p className="text-sm text-muted-foreground">Manage ambassador data and points</p>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                      <div className="relative flex-1">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search by email or wallet address..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-8"
                        />
                      </div>
                      <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-full sm:w-40">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="suspended">Suspended</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-full sm:w-40">
                          <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="points">Points</SelectItem>
                          <SelectItem value="mindshare">Mindshare</SelectItem>
                          <SelectItem value="tasks">Tasks</SelectItem>
                          <SelectItem value="email">Email</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                      >
                        {sortOrder === "asc" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </Button>
                    </div>

                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Ambassador</TableHead>
                            <TableHead>Wallet</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Points</TableHead>
                            <TableHead>Mindshare</TableHead>
                            <TableHead>Tasks</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredAmbassadors.map((ambassador) => (
                            <TableRow key={ambassador.id} className="hover:bg-muted/50">
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  <Avatar className="h-8 w-8">
                                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${ambassador.email}`} />
                                    <AvatarFallback>{ambassador.email.charAt(0).toUpperCase()}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-medium">{ambassador.email}</p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="font-mono text-sm">
                                {ambassador.wallet_address.slice(0, 6)}...{ambassador.wallet_address.slice(-4)}
                              </TableCell>
                              <TableCell>
                                <Badge variant={ambassador.status === 'active' ? 'default' : 'secondary'}>
                                  {ambassador.status || 'active'}
                                </Badge>
                              </TableCell>
                              <TableCell>{ambassador.points}</TableCell>
                              <TableCell>{ambassador.mindshare_score}</TableCell>
                              <TableCell>{ambassador.tasks_completed}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Dialog
                                    open={dialogOpen && selectedAmbassador?.id === ambassador.id}
                                    onOpenChange={(open) => {
                                      if (open) {
                                        setSelectedAmbassador(ambassador)
                                        setDialogOpen(true)
                                      } else {
                                        handleDialogOpenChange(false)
                                      }
                                    }}
                                  >
                                    <DialogTrigger asChild>
                                      <Button variant="outline" size="sm">
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                      <DialogHeader>
                                        <DialogTitle>Adjust Points for {selectedAmbassador?.email}</DialogTitle>
                                        <DialogDescription>Current points: {selectedAmbassador?.points}</DialogDescription>
                                      </DialogHeader>
                                      <div className="space-y-4">
                                        <div>
                                          <Label htmlFor="points">Points Adjustment</Label>
                                          <Input
                                            id="points"
                                            type="number"
                                            placeholder="Enter positive or negative number"
                                            value={pointsAdjustment}
                                            onChange={(e) => setPointsAdjustment(e.target.value)}
                                          />
                                        </div>
                                        <div>
                                          <Label htmlFor="reason">Reason</Label>
                                          <Textarea
                                            id="reason"
                                            placeholder="Reason for points adjustment..."
                                            value={adjustmentReason}
                                            onChange={(e) => setAdjustmentReason(e.target.value)}
                                          />
                                        </div>
                                        <div className="flex space-x-2">
                                          <Button onClick={handlePointsAdjustment} disabled={!pointsAdjustment}>
                                            Update Points
                                          </Button>
                                          <Button variant="outline" onClick={() => handleDialogOpenChange(false)}>
                                            Cancel
                                          </Button>
                                        </div>
                                      </div>
                                    </DialogContent>
                                  </Dialog>
                                  <Button variant="outline" size="sm">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeView === 'team' && <TeamSection />}
            {activeView === 'tasks' && <TaskBoard />}
            {activeView === 'analytics' && (
              <div className="space-y-6">
                <AnalyticsCharts />
                <RevenueChart />
              </div>
            )}
            {activeView === 'reports' && <ReportGenerator />}
            {activeView === 'settings' && (
              <Card>
                <CardHeader>
                  <CardTitle>System Settings</CardTitle>
                  <p className="text-sm text-muted-foreground">Configure system preferences and features</p>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Settings className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Settings panel coming soon...</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

export default ModeratorDashboard