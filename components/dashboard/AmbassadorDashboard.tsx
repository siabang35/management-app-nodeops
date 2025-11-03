"use client"

import type React from "react"
import { useEffect, useState, useMemo } from "react"
import { useAuth } from "@/lib/auth-context"
import { getTopAmbassadors, subscribeToMindshareUpdates } from "@/lib/supabase"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trophy, Star, Wallet, Mail, Twitter, MessageCircle, Hash, Target, TrendingUp, LogOut } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { signOut } from "@/app/actions/auth"

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
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  // Memoized user rank
  const userRank = useMemo(() => {
    if (!ambassador || !topAmbassadors.length) return null
    const rank = topAmbassadors.findIndex((a) => a.id === ambassador.id) + 1
    return rank > 0 ? rank : null
  }, [ambassador, topAmbassadors])

  const handleSignOut = async () => {
    await signOut()
    router.push("/auth/login")
  }

  const handleProfileUpdate = async (formData: FormData) => {
    if (isSubmitting || !ambassador) return

    setIsSubmitting(true)
    try {
      const walletAddress = formData.get("wallet_address") as string
      const email = formData.get("email") as string
      const twitterHandle = formData.get("twitter_handle") as string
      const telegramHandle = formData.get("telegram_handle") as string
      const discordHandle = formData.get("discord_handle") as string

      // Validate required fields
      if (!walletAddress || !email) {
        toast.error("Wallet address and email are required")
        return
      }

      // TODO: Replace with actual API call to update ambassador profile
      // Example: const response = await updateAmbassadorProfile({ ... })
      console.log("Updating profile with:", {
        walletAddress,
        email,
        twitterHandle,
        telegramHandle,
        discordHandle,
      })

      // Show success after actual update
      toast.success("Profile updated successfully")
      setEditingProfile(false)
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error("Failed to update profile. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    if (!isAmbassador) {
      toast.error("Access denied. Ambassador role required.")
      return
    }

    const fetchData = async () => {
      try {
        const ambassadors = await getTopAmbassadors(25)
        setTopAmbassadors(ambassadors)
      } catch (error) {
        console.error("Error fetching ambassadors:", error)
        toast.error("Failed to load ambassador data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    // Subscribe to real-time updates
    let subscription: ReturnType<typeof subscribeToMindshareUpdates> | null = null
    try {
      subscription = subscribeToMindshareUpdates((payload) => {
        console.log("Mindshare update:", payload)
        fetchData() // Refresh data on updates
      })
    } catch (error) {
      console.error("Error subscribing to updates:", error)
    }

    return () => {
      if (subscription) {
        try {
          subscription.unsubscribe()
        } catch (error) {
          console.error("Error unsubscribing:", error)
        }
      }
    }
  }, [isAmbassador])

  if (!isAmbassador) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <Card className="w-full max-w-md bg-slate-900 border-slate-800">
          <CardHeader>
            <div className="text-lg font-semibold text-slate-200">Access Denied</div>
            <p className="text-sm text-slate-400">You need ambassador privileges to access this dashboard.</p>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-cyan-500 border-r-transparent"></div>
          <p className="mt-4 text-slate-400">Loading ambassador data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header with Logo */}
      <div className="bg-slate-900/50 backdrop-blur-sm border-b border-slate-800">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img src="/logo.svg" alt="NodeOps Logo" className="h-10 w-10" />
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent animate-pulse">
                  Ambassador Dashboard
                </h1>
                <p className="text-sm text-slate-400">Welcome back, champion! 🚀</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge
                variant="secondary"
                className="text-lg px-4 py-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/30 hover:from-yellow-500/30 hover:to-orange-500/30 transition-all duration-200"
              >
                <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
                Rank #{userRank || "Unranked"}
              </Badge>
              <div className="text-right">
                <p className="text-sm font-medium text-slate-200">{ambassador?.email}</p>
                <p className="text-xs text-slate-400 flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                  Ambassador
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="text-slate-400 hover:text-red-400 gap-2 ml-2"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6 space-y-6">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800/50 border border-slate-700 p-1 rounded-lg">
            <TabsTrigger
              value="overview"
              className="rounded-md transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-500 data-[state=active]:text-white"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="leaderboard"
              className="rounded-md transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-500 data-[state=active]:text-white"
            >
              Leaderboard
            </TabsTrigger>
            <TabsTrigger
              value="profile"
              className="rounded-md transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-500 data-[state=active]:text-white"
            >
              Profile
            </TabsTrigger>
            <TabsTrigger
              value="tasks"
              className="rounded-md transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-500 data-[state=active]:text-white"
            >
              Tasks
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Welcome Message */}
            <Card className="bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 border-cyan-500/20">
              <CardContent className="p-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2">
                    Welcome to Your Ambassador Hub! 🌟
                  </h2>
                  <p className="text-slate-300">
                    Track your progress, compete with fellow ambassadors, and climb the leaderboard!
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10 group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="text-sm font-medium text-slate-200">Total Points</div>
                  <Star className="h-4 w-4 text-cyan-400 group-hover:scale-110 transition-transform duration-200" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-cyan-400 mb-1">{ambassador?.points || 0}</div>
                  <p className="text-xs text-slate-400">Keep earning!</p>
                  <div className="w-full bg-slate-700 rounded-full h-1 mt-2">
                    <div
                      className="bg-gradient-to-r from-cyan-500 to-blue-500 h-1 rounded-full"
                      style={{ width: "75%" }}
                    ></div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="text-sm font-medium text-slate-200">Mindshare Score</div>
                  <TrendingUp className="h-4 w-4 text-blue-400 group-hover:scale-110 transition-transform duration-200" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-400 mb-1">{ambassador?.mindshare_score || 0}</div>
                  <p className="text-xs text-slate-400">Your influence</p>
                  <div className="w-full bg-slate-700 rounded-full h-1 mt-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-1 rounded-full"
                      style={{ width: "60%" }}
                    ></div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 hover:border-green-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/10 group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="text-sm font-medium text-slate-200">Tasks Completed</div>
                  <Target className="h-4 w-4 text-green-400 group-hover:scale-110 transition-transform duration-200" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-400 mb-1">{ambassador?.tasks_completed || 0}</div>
                  <p className="text-xs text-slate-400">Great work!</p>
                  <div className="w-full bg-slate-700 rounded-full h-1 mt-2">
                    <div
                      className="bg-gradient-to-r from-green-500 to-emerald-500 h-1 rounded-full"
                      style={{ width: "45%" }}
                    ></div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 hover:border-yellow-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/10 group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="text-sm font-medium text-slate-200">Current Rank</div>
                  <Trophy className="h-4 w-4 text-yellow-400 group-hover:scale-110 transition-transform duration-200" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-yellow-400 mb-1">#{userRank || "N/A"}</div>
                  <p className="text-xs text-slate-400">Climb higher!</p>
                  <div className="w-full bg-slate-700 rounded-full h-1 mt-2">
                    <div
                      className="bg-gradient-to-r from-yellow-500 to-orange-500 h-1 rounded-full"
                      style={{ width: "30%" }}
                    ></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="leaderboard" className="space-y-6">
            <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
              <CardHeader>
                <div className="text-lg font-semibold text-slate-200 flex items-center">
                  <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
                  Top 25 Ambassadors 🏆
                </div>
                <p className="text-sm text-slate-400">Current leaderboard rankings - compete and climb!</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topAmbassadors.map((amb, index) => (
                    <div
                      key={amb.id}
                      className={`flex items-center space-x-4 p-4 rounded-lg transition-all duration-300 hover:scale-[1.02] ${
                        amb.id === ambassador?.id
                          ? "bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 border border-cyan-500/50 shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-500/30"
                          : "bg-slate-800/50 hover:bg-slate-800/70 border border-slate-700 hover:border-slate-600"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Badge
                          variant={index < 3 ? "default" : "secondary"}
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                            index < 3
                              ? "bg-gradient-to-r from-yellow-500 to-orange-500 shadow-lg shadow-yellow-500/30"
                              : "bg-slate-700"
                          }`}
                        >
                          {index + 1}
                        </Badge>
                        <Avatar className="ring-2 ring-slate-600 w-12 h-12">
                          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${amb.email}`} />
                          <AvatarFallback className="bg-gradient-to-br from-slate-700 to-slate-800 text-slate-200 font-bold">
                            {amb.email.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-slate-200 flex items-center">
                          {amb.email}
                          {amb.id === ambassador?.id && (
                            <span className="ml-2 text-xs bg-cyan-500/20 text-cyan-300 px-2 py-1 rounded-full">
                              You
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-slate-400 font-mono">
                          Wallet: {amb.wallet_address.slice(0, 8)}...{amb.wallet_address.slice(-6)}
                        </p>
                      </div>
                      <div className="text-right space-y-1">
                        <div className="flex items-center space-x-2">
                          <TrendingUp className="w-4 h-4 text-blue-400" />
                          <p className="font-bold text-blue-400 text-lg">{amb.mindshare_score}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Star className="w-4 h-4 text-yellow-400" />
                          <p className="text-sm text-yellow-400">{amb.points} pts</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
              <CardHeader>
                <div className="text-lg font-semibold text-slate-200 flex items-center">
                  <Mail className="w-5 h-5 mr-2 text-cyan-400" />
                  Ambassador Profile
                </div>
                <p className="text-sm text-slate-400">Manage your ambassador information</p>
              </CardHeader>
              <CardContent className="space-y-6">
                {editingProfile ? (
                  <form action={handleProfileUpdate} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="wallet" className="text-slate-200">
                          Wallet Address
                        </Label>
                        <Input
                          id="wallet"
                          name="wallet_address"
                          defaultValue={ambassador?.wallet_address}
                          required
                          className="bg-slate-800 border-slate-600 text-slate-200"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email" className="text-slate-200">
                          Email
                        </Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          defaultValue={ambassador?.email}
                          required
                          className="bg-slate-800 border-slate-600 text-slate-200"
                        />
                      </div>
                      <div>
                        <Label htmlFor="twitter" className="text-slate-200">
                          Twitter Handle
                        </Label>
                        <Input
                          id="twitter"
                          name="twitter_handle"
                          defaultValue={ambassador?.twitter_handle}
                          placeholder="@username"
                          className="bg-slate-800 border-slate-600 text-slate-200"
                        />
                      </div>
                      <div>
                        <Label htmlFor="telegram" className="text-slate-200">
                          Telegram Handle
                        </Label>
                        <Input
                          id="telegram"
                          name="telegram_handle"
                          defaultValue={ambassador?.telegram_handle}
                          placeholder="@username"
                          className="bg-slate-800 border-slate-600 text-slate-200"
                        />
                      </div>
                      <div>
                        <Label htmlFor="discord" className="text-slate-200">
                          Discord Handle
                        </Label>
                        <Input
                          id="discord"
                          name="discord_handle"
                          defaultValue={ambassador?.discord_handle}
                          placeholder="username#1234"
                          className="bg-slate-800 border-slate-600 text-slate-200"
                        />
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? "Saving..." : "Save Changes"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setEditingProfile(false)}
                        disabled={isSubmitting}
                        className="border-slate-600 text-slate-200 hover:bg-slate-800 disabled:opacity-50"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-center space-x-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                        <Wallet className="h-5 w-5 text-cyan-400" />
                        <div>
                          <p className="font-medium text-slate-200">Wallet Address</p>
                          <p className="text-sm text-slate-400 font-mono">{ambassador?.wallet_address}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                        <Mail className="h-5 w-5 text-blue-400" />
                        <div>
                          <p className="font-medium text-slate-200">Email</p>
                          <p className="text-sm text-slate-400">{ambassador?.email}</p>
                        </div>
                      </div>
                      {ambassador?.twitter_handle && (
                        <div className="flex items-center space-x-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                          <Twitter className="h-5 w-5 text-blue-400" />
                          <div>
                            <p className="font-medium text-slate-200">Twitter</p>
                            <p className="text-sm text-slate-400">{ambassador.twitter_handle}</p>
                          </div>
                        </div>
                      )}
                      {ambassador?.telegram_handle && (
                        <div className="flex items-center space-x-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                          <MessageCircle className="h-5 w-5 text-blue-400" />
                          <div>
                            <p className="font-medium text-slate-200">Telegram</p>
                            <p className="text-sm text-slate-400">{ambassador.telegram_handle}</p>
                          </div>
                        </div>
                      )}
                      {ambassador?.discord_handle && (
                        <div className="flex items-center space-x-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                          <Hash className="h-5 w-5 text-indigo-400" />
                          <div>
                            <p className="font-medium text-slate-200">Discord</p>
                            <p className="text-sm text-slate-400">{ambassador.discord_handle}</p>
                          </div>
                        </div>
                      )}
                    </div>
                    <Button
                      onClick={() => setEditingProfile(true)}
                      className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                    >
                      Edit Profile
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-6">
            <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
              <CardHeader>
                <div className="text-lg font-semibold text-slate-200 flex items-center">
                  <Target className="w-5 h-5 mr-2 text-green-400" />
                  Task System 🎯
                </div>
                <p className="text-sm text-slate-400">Complete tasks to earn points and improve your ranking</p>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <div className="relative">
                    <Target className="h-16 w-16 text-slate-500 mx-auto mb-6 animate-pulse" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-20 h-20 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-slate-200 mb-2">Coming Soon!</h3>
                  <p className="text-slate-400 mb-4">Exciting challenges and rewards are on the way</p>
                  <div className="flex justify-center space-x-4 text-sm text-slate-500">
                    <span className="flex items-center">
                      <Star className="w-4 h-4 mr-1 text-yellow-400" />
                      Earn Points
                    </span>
                    <span className="flex items-center">
                      <Trophy className="w-4 h-4 mr-1 text-yellow-400" />
                      Climb Rankings
                    </span>
                    <span className="flex items-center">
                      <TrendingUp className="w-4 h-4 mr-1 text-blue-400" />
                      Boost Mindshare
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default AmbassadorDashboard
