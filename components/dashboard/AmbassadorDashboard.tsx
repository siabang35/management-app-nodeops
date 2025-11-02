"use client"

import React, { useEffect, useState, useMemo } from 'react'
import { useAuth } from '@/lib/auth-context'
import { getTopAmbassadors, subscribeToMindshareUpdates } from '@/lib/supabase'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Trophy, Star, Wallet, Mail, Twitter, MessageCircle, Hash, Target, TrendingUp } from 'lucide-react'
import { toast } from 'sonner'

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
  const { ambassador, isAmbassador } = useAuth()
  const [topAmbassadors, setTopAmbassadors] = useState<Ambassador[]>([])
  const [loading, setLoading] = useState(true)
  const [editingProfile, setEditingProfile] = useState(false)

  // Memoized user rank
  const userRank = useMemo(() => {
    if (!ambassador || !topAmbassadors.length) return null
    const rank = topAmbassadors.findIndex(a => a.id === ambassador.id) + 1
    return rank > 0 ? rank : null
  }, [ambassador, topAmbassadors])

  useEffect(() => {
    if (!isAmbassador) {
      toast.error('Access denied. Ambassador role required.')
      return
    }

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
  }, [isAmbassador])

  const handleProfileUpdate = async (formData: FormData) => {
    // Implementation for updating ambassador profile
    toast.success('Profile updated successfully')
    setEditingProfile(false)
  }

  if (!isAmbassador) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="text-lg font-semibold">Access Denied</div>
            <p className="text-sm text-muted-foreground">You need ambassador privileges to access this dashboard.</p>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Ambassador Dashboard</h1>
        <Badge variant="secondary" className="text-lg px-4 py-2">
          <Trophy className="w-5 h-5 mr-2" />
          Rank #{userRank || 'Unranked'}
        </Badge>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="text-sm font-medium">Total Points</div>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{ambassador?.points || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="text-sm font-medium">Mindshare Score</div>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{ambassador?.mindshare_score || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="text-sm font-medium">Tasks Completed</div>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{ambassador?.tasks_completed || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="text-sm font-medium">Current Rank</div>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">#{userRank || 'N/A'}</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="text-lg font-semibold">Top 25 Ambassadors</div>
              <p className="text-sm text-muted-foreground">Current leaderboard rankings</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topAmbassadors.map((amb, index) => (
                  <div key={amb.id} className={`flex items-center space-x-4 p-4 rounded-lg ${amb.id === ambassador?.id ? 'bg-primary/10 border border-primary' : 'bg-muted'}`}>
                    <div className="flex items-center space-x-2">
                      <Badge variant={index < 3 ? "default" : "secondary"} className="w-8 h-8 rounded-full flex items-center justify-center">
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
                      <p className="font-bold">{amb.mindshare_score} pts</p>
                      <p className="text-sm text-muted-foreground">{amb.points} total</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile" className="space-y-6">
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
        </TabsContent>

        <TabsContent value="tasks" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="text-lg font-semibold">Task System</div>
              <p className="text-sm text-muted-foreground">Complete tasks to earn points and improve your ranking</p>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Task system integration coming soon...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default AmbassadorDashboard
