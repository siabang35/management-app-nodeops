"use client"

import React, { useEffect, useState, useMemo } from 'react'
import { useAuth } from '@/lib/auth-context'
import { getTopAmbassadors, subscribeToMindshareUpdates } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Trophy,
  Star,
  Wallet,
  Mail,
  Twitter,
  MessageCircle,
  Hash,
  Target,
  TrendingUp,
  Users,
  BarChart3,
  FileText,
  Home,
  Crown,
  CheckSquare,
  UserCheck,
  PieChart,
  ClipboardList,
  User,
  Zap,
  LogOut,
  Bell,
  Settings,
  Search,
  Filter,
  Download,
  Award,
  Activity,
  ChevronUp,
  ChevronDown
} from 'lucide-react'
import { toast } from 'sonner'

// Import dashboard components
import { MetricsGrid } from './metrics-grid'
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
}

const AmbassadorDashboard: React.FC = () => {
  const { ambassador, isAmbassador, user, signOut } = useAuth()
  const [topAmbassadors, setTopAmbassadors] = useState<Ambassador[]>([])
  const [loading, setLoading] = useState(true)
  const [editingProfile, setEditingProfile] = useState(false)
  const [activeView, setActiveView] = useState('dashboard')

  // Memoized user rank
  const userRank = useMemo(() => {
    if (!ambassador || !topAmbassadors.length) return null
    const rank = topAmbassadors.findIndex(a => a.id === ambassador.id) + 1
    return rank > 0 ? rank : null
  }, [ambassador, topAmbassadors])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const ambassadors = await getTopAmbassadors(25)
        setTopAmbassadors(ambassadors)
      } catch (error) {
        console.error('Error fetching ambassadors:', error)
        toast.error('Failed to load ambassador data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    // Subscribe to real-time updates
    const subscription = subscribeToMindshareUpdates((payload) => {
      console.log('Mindshare update:', payload)
      fetchData() // Refresh data on updates
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const handleProfileUpdate = async (formData: FormData) => {
    // Implementation for updating ambassador profile
    toast.success('Profile updated successfully')
    setEditingProfile(false)
  }

  const handleLogout = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  // Sidebar navigation items
  const navigationItems = [
    { name: "Dashboard", icon: Home, id: "dashboard" },
    { name: "Leaderboard", icon: Crown, id: "leaderboard" },
    { name: "Tasks", icon: CheckSquare, id: "tasks" },
    { name: "Team", icon: UserCheck, id: "team" },
    { name: "Analytics", icon: PieChart, id: "analytics" },
    { name: "Reports", icon: ClipboardList, id: "reports" },
    { name: "Profile", icon: User, id: "profile" },
    { name: "Wallet", icon: Wallet, id: "wallet" },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary animate-glow-pulse"></div>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <Sidebar className="border-r border-border/50 bg-gradient-to-b from-card via-card to-card/80">
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
                  <Trophy className="w-3 h-3 text-accent" />
                  Ambassador
                </p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent className="px-4 py-4">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Navigation
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
                    {user?.email?.slice(0, 2).toUpperCase() || 'AM'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-sm truncate">
                    {user?.email?.split('@')[0] || 'Ambassador'}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    Rank #{userRank || 'N/A'}
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
                  <Trophy className="w-4 h-4 mr-1" />
                  Ambassador
                </Badge>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-2">
                  <Bell className="w-4 h-4" />
                  Notifications
                </Button>
              </div>
            </div>
          </header>

          <main className="flex-1 p-6 space-y-6">
            {activeView === 'dashboard' && (
              <div className="space-y-6">
                {/* Key Metrics Grid */}
                <MetricsGrid />

                {/* Activity Feed and Quick Stats */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <ActivityFeed />
                  </div>
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <div className="text-lg font-semibold">Quick Stats</div>
                        <p className="text-sm text-muted-foreground">Your performance overview</p>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm">Total Points</span>
                          </div>
                          <span className="font-bold">{ambassador?.points || 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <TrendingUp className="h-4 w-4 text-green-500" />
                            <span className="text-sm">Mindshare Score</span>
                          </div>
                          <span className="font-bold">{ambassador?.mindshare_score || 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Target className="h-4 w-4 text-blue-500" />
                            <span className="text-sm">Tasks Completed</span>
                          </div>
                          <span className="font-bold">{ambassador?.tasks_completed || 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Trophy className="h-4 w-4 text-purple-500" />
                            <span className="text-sm">Current Rank</span>
                          </div>
                          <span className="font-bold">#{userRank || 'N/A'}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            )}

            {activeView === 'leaderboard' && (
              <Card>
                <CardHeader>
                  <div className="text-lg font-semibold">Top 25 Ambassadors</div>
                  <p className="text-sm text-muted-foreground">Current leaderboard rankings</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topAmbassadors.map((amb, index) => (
                      <div key={amb.id} className={`flex items-center space-x-4 p-4 rounded-lg hover-lift transition-all duration-300 ${amb.id === ambassador?.id ? 'bg-primary/10 border border-primary neon-border' : 'bg-muted'}`}>
                        <div className="flex items-center space-x-2">
                          <Badge variant={index < 3 ? "default" : "secondary"} className="w-8 h-8 rounded-full flex items-center justify-center animate-bounce-smooth">
                            {index + 1}
                          </Badge>
                          <Avatar>
                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${amb.email}`} />
                            <AvatarFallback>{amb.email.charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{amb.email}</p>
                          <p className="text-sm text-muted-foreground">Wallet: {amb.wallet_address.slice(0, 6)}...{amb.wallet_address.slice(-4)}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-primary">{amb.mindshare_score} pts</p>
                          <p className="text-sm text-muted-foreground">{amb.points} total</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {activeView === 'profile' && (
              <Card>
                <CardHeader>
                  <div className="text-lg font-semibold">Ambassador Profile</div>
                  <p className="text-sm text-muted-foreground">Manage your ambassador information</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {editingProfile ? (
                    <form action={handleProfileUpdate} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="wallet">Wallet Address</Label>
                          <Input id="wallet" name="wallet_address" defaultValue={ambassador?.wallet_address} required />
                        </div>
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Input id="email" name="email" type="email" defaultValue={ambassador?.email} required />
                        </div>
                        <div>
                          <Label htmlFor="twitter">Twitter Handle</Label>
                          <Input id="twitter" name="twitter_handle" defaultValue={ambassador?.twitter_handle} placeholder="@username" />
                        </div>
                        <div>
                          <Label htmlFor="telegram">Telegram Handle</Label>
                          <Input id="telegram" name="telegram_handle" defaultValue={ambassador?.telegram_handle} placeholder="@username" />
                        </div>
                        <div>
                          <Label htmlFor="discord">Discord Handle</Label>
                          <Input id="discord" name="discord_handle" defaultValue={ambassador?.discord_handle} placeholder="username#1234" />
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button type="submit">Save Changes</Button>
                        <Button type="button" variant="outline" onClick={() => setEditingProfile(false)}>Cancel</Button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-center space-x-2">
                          <Wallet className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Wallet Address</p>
                            <p className="text-sm text-muted-foreground">{ambassador?.wallet_address}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Mail className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Email</p>
                            <p className="text-sm text-muted-foreground">{ambassador?.email}</p>
                          </div>
                        </div>
                        {ambassador?.twitter_handle && (
                          <div className="flex items-center space-x-2">
                            <Twitter className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium">Twitter</p>
                              <p className="text-sm text-muted-foreground">{ambassador.twitter_handle}</p>
                            </div>
                          </div>
                        )}
                        {ambassador?.telegram_handle && (
                          <div className="flex items-center space-x-2">
                            <MessageCircle className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium">Telegram</p>
                              <p className="text-sm text-muted-foreground">{ambassador.telegram_handle}</p>
                            </div>
                          </div>
                        )}
                        {ambassador?.discord_handle && (
                          <div className="flex items-center space-x-2">
                            <Hash className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium">Discord</p>
                              <p className="text-sm text-muted-foreground">{ambassador.discord_handle}</p>
                            </div>
                          </div>
                        )}
                      </div>
                      <Button onClick={() => setEditingProfile(true)}>Edit Profile</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {activeView === 'tasks' && <TaskBoard />}
            {activeView === 'team' && <TeamSection />}
            {activeView === 'analytics' && (
              <div className="space-y-6">
                <AnalyticsCharts />
                <RevenueChart />
              </div>
            )}
            {activeView === 'reports' && <ReportGenerator />}
            {activeView === 'wallet' && (
              <Card>
                <CardHeader>
                  <div className="text-lg font-semibold">Web3 Wallet</div>
                  <p className="text-sm text-muted-foreground">Manage your blockchain wallet connection</p>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Wallet className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Wallet integration coming soon...</p>
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

export default AmbassadorDashboard
