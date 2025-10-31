"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { getCurrentUser } from "@/app/actions/auth"
import { getMindshareUserProfile } from "@/app/actions/mindshare"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Mail, Copy, Award, TrendingUp, Edit2, Save } from "lucide-react"

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [copied, setCopied] = useState("")
  const [formData, setFormData] = useState<any>({})

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const currentUser = await getCurrentUser()
        if (currentUser) {
          setUser(currentUser)

          const { data: profileData } = await getMindshareUserProfile(currentUser.id)
          if (profileData) {
            setProfile(profileData)
            setFormData({
              xHandle: profileData.x_handle || "",
              telegramId: profileData.telegram_id || "",
              discordId: profileData.discord_id || "",
              profileBio: profileData.profile_bio || "",
            })
          }
        }
      } catch (error) {
        console.error("Error loading profile:", error)
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [])

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopied(field)
    setTimeout(() => setCopied(""), 2000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-slate-400">Loading profile...</div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 min-h-screen">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-4xl font-bold text-white mb-2">My Profile</h1>
        <p className="text-slate-400">Manage your NodeOps account and settings</p>
      </motion.div>

      {user && profile && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <motion.div
            className="lg:col-span-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 overflow-hidden sticky top-8">
              <CardContent className="p-0">
                <div className="bg-gradient-to-r from-blue-600 to-cyan-600 h-24"></div>
                <div className="relative px-6 pb-6">
                  <motion.div className="flex flex-col items-center -mt-14 mb-4" whileHover={{ scale: 1.05 }}>
                    <Avatar className="w-28 h-28 border-4 border-slate-900">
                      <AvatarImage src={profile.profile_avatar_url || "/placeholder.svg"} alt={user.email} />
                      <AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </motion.div>
                  <div className="text-center">
                    <h2 className="text-xl font-bold text-white">{user.email}</h2>
                    <p className="text-sm text-cyan-400 mt-1">Rank #{profile.rank || "TBD"}</p>
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                        <span className="text-slate-300 text-sm">Mindshare Score</span>
                        <span className="font-bold text-cyan-400">
                          {profile.mindshare_score?.toLocaleString() || "0"}
                        </span>
                      </div>
                      {profile.is_verified && (
                        <Badge className="w-full justify-center bg-emerald-600/30 text-emerald-300">Verified</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Content */}
          <motion.div
            className="lg:col-span-2 space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-slate-800/50 border border-slate-700">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-4">
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">Account Information</CardTitle>
                    <CardDescription>Your wallet and contact details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Wallet */}
                    <motion.div
                      className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors"
                      whileHover={{ x: 4 }}
                    >
                      <div>
                        <p className="text-sm text-slate-400">Wallet Address</p>
                        <p className="font-mono text-sm text-white mt-1">{profile.wallet_address}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(profile.wallet_address, "wallet")}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </motion.div>

                    {/* Email */}
                    <motion.div
                      className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors"
                      whileHover={{ x: 4 }}
                    >
                      <div>
                        <p className="text-sm text-slate-400">Email</p>
                        <p className="text-sm text-white mt-1 flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          {profile.email}
                        </p>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => copyToClipboard(profile.email, "email")}>
                        <Copy className="w-4 h-4" />
                      </Button>
                    </motion.div>

                    {/* Promo Code */}
                    <motion.div
                      className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg"
                      whileHover={{ x: 4 }}
                    >
                      <div>
                        <p className="text-sm text-slate-400">Promo Code</p>
                        <p className="font-mono text-sm text-cyan-400 font-bold mt-1">{profile.promo_code}</p>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => copyToClipboard(profile.promo_code, "promo")}>
                        <Copy className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  </CardContent>
                </Card>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700">
                    <CardContent className="p-6 flex items-center gap-3">
                      <div className="p-3 bg-gradient-to-br from-amber-600 to-amber-400 rounded-lg">
                        <Award className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-slate-400 text-sm">Current Rank</p>
                        <p className="text-2xl font-bold text-white">#{profile.rank || "—"}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700">
                    <CardContent className="p-6 flex items-center gap-3">
                      <div className="p-3 bg-gradient-to-br from-emerald-600 to-emerald-400 rounded-lg">
                        <TrendingUp className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-slate-400 text-sm">This Month</p>
                        <p className="text-2xl font-bold text-emerald-400">+850</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="space-y-4">
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-white">Social Links</CardTitle>
                        <CardDescription>Update your social media handles</CardDescription>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => setEditing(!editing)}
                        className={editing ? "bg-emerald-600" : ""}
                      >
                        {editing ? (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Save Changes
                          </>
                        ) : (
                          <>
                            <Edit2 className="w-4 h-4 mr-2" />
                            Edit
                          </>
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-slate-300">X / Twitter Handle</label>
                      <Input
                        type="text"
                        placeholder="@your_handle"
                        value={formData.xHandle}
                        onChange={(e) => setFormData({ ...formData, xHandle: e.target.value })}
                        disabled={!editing}
                        className="mt-1 bg-slate-700/50 border-slate-600 text-white"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-300">Telegram ID</label>
                      <Input
                        type="text"
                        placeholder="@telegram_username"
                        value={formData.telegramId}
                        onChange={(e) => setFormData({ ...formData, telegramId: e.target.value })}
                        disabled={!editing}
                        className="mt-1 bg-slate-700/50 border-slate-600 text-white"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-300">Discord ID</label>
                      <Input
                        type="text"
                        placeholder="Discord#0000"
                        value={formData.discordId}
                        onChange={(e) => setFormData({ ...formData, discordId: e.target.value })}
                        disabled={!editing}
                        className="mt-1 bg-slate-700/50 border-slate-600 text-white"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-300">Bio</label>
                      <textarea
                        placeholder="Tell us about yourself..."
                        value={formData.profileBio}
                        onChange={(e) => setFormData({ ...formData, profileBio: e.target.value })}
                        disabled={!editing}
                        className="mt-1 w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white resize-none"
                        rows={4}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Activity Tab */}
              <TabsContent value="activity" className="space-y-4">
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">Recent Activity</CardTitle>
                    <CardDescription>Your mindshare contributions and achievements</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { type: "Completed Task", points: "+250", date: "2 hours ago" },
                        { type: "Social Share", points: "+100", date: "5 hours ago" },
                        { type: "Community Engagement", points: "+150", date: "1 day ago" },
                        { type: "Referral", points: "+500", date: "3 days ago" },
                      ].map((activity, i) => (
                        <motion.div
                          key={i}
                          className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                        >
                          <div>
                            <p className="text-white font-medium">{activity.type}</p>
                            <p className="text-xs text-slate-400">{activity.date}</p>
                          </div>
                          <span className="text-emerald-400 font-bold">{activity.points}</span>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      )}
    </div>
  )
}
