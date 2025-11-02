"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Medal, TrendingUp, Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getMindshareLeaderboard } from "@/app/actions/mindshare"

interface LeaderboardUser {
  id: string
  user_id: string
  wallet_address?: string
  email?: string
  x_handle?: string
  telegram_id?: string
  discord_id?: string
  discord_username?: string
  profile_avatar_url?: string
  mindshare_score: number
  rank: number
  current_rank: number
  mindshare_users?: {
    id: string
    user_id: string
    wallet_address?: string
    email?: string
    x_handle?: string
    telegram_id?: string
    discord_id?: string
    discord_username?: string
    profile_avatar_url?: string
    mindshare_score: number
    rank: number
  }
}

export function Leaderboard({ onSelectUser }: any) {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadLeaderboard()
  }, [])

  const loadLeaderboard = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const result = await getMindshareLeaderboard(25)

      if (result.error) {
        console.error("Failed to load leaderboard:", result.error)
        setError("Failed to load leaderboard data. Please try again later.")
        setLeaderboardData([]) // Clear any existing data
      } else {
        setLeaderboardData(result.data || [])
      }
    } catch (err: any) {
      console.error("Error loading leaderboard:", err)
      setError("Failed to load leaderboard data. Please try again later.")
      setLeaderboardData([])
    } finally {
      setIsLoading(false)
    }
  }

  const formatUserName = (user: LeaderboardUser) => {
    if (user.mindshare_users) {
      return user.mindshare_users.discord_username || user.mindshare_users.email?.split('@')[0] || `User ${user.rank}`
    }
    return `User ${user.rank}`
  }

  const getUserAvatar = (user: LeaderboardUser) => {
    return user.mindshare_users?.profile_avatar_url || "/placeholder-user.jpg"
  }

  const getUserBadges = (user: LeaderboardUser) => {
    const badges = []
    if (user.rank <= 3) badges.push("Top Contributor")
    else if (user.rank <= 10) badges.push("Active")
    if (user.mindshare_users?.wallet_address) badges.push("Web3")
    return badges
  }

  if (isLoading) {
    return (
      <Card className="bg-slate-800/50 border-slate-700 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-amber-600/20 to-yellow-600/20 border-b border-slate-700">
          <h3 className="text-white flex items-center gap-2 font-semibold">
            <Medal className="w-6 h-6 text-amber-400" />
            Top 25 Contributors
          </h3>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
          <span className="ml-2 text-slate-300">Loading leaderboard...</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-slate-800/50 border-slate-700 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-amber-600/20 to-yellow-600/20 border-b border-slate-700">
        <h3 className="text-white flex items-center gap-2 font-semibold">
          <Medal className="w-6 h-6 text-amber-400" />
          Top 25 Contributors
        </h3>
      </CardHeader>
      <CardContent className="p-0">
        {error && (
          <div className="p-4">
            <Alert className="border-red-500/50 bg-red-500/10">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-red-300">
                {error}
              </AlertDescription>
            </Alert>
          </div>
        )}
        {!error && leaderboardData.length === 0 && (
          <div className="p-4">
            <Alert className="border-yellow-500/50 bg-yellow-500/10">
              <AlertCircle className="h-4 w-4 text-yellow-400" />
              <AlertDescription className="text-yellow-300">
                No leaderboard data available yet. Start participating to see rankings!
              </AlertDescription>
            </Alert>
          </div>
        )}
        {!error && leaderboardData.length > 0 && (
          <div className="space-y-1 max-h-[600px] overflow-y-auto">
            {leaderboardData.map((user, index) => (
              <motion.button
                key={user.id}
                onClick={() => onSelectUser({
                  id: user.user_id,
                  name: formatUserName(user),
                  rank: user.rank,
                  score: user.mindshare_score,
                  avatar: getUserAvatar(user),
                  badge: getUserBadges(user),
                  walletAddress: user.mindshare_users?.wallet_address,
                  email: user.mindshare_users?.email,
                  xHandle: user.mindshare_users?.x_handle,
                  telegramId: user.mindshare_users?.telegram_id,
                  discordUsername: user.mindshare_users?.discord_username,
                })}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.02 }}
                className="w-full px-6 py-4 flex items-center gap-4 hover:bg-slate-700/50 transition-colors text-left border-b border-slate-700/50 last:border-0"
                whileHover={{ x: 4 }}
              >
                {/* Rank */}
                <div className="flex-shrink-0 w-8">
                  {user.rank <= 3 ? (
                    <motion.div
                      className={`text-lg font-bold flex items-center justify-center w-8 h-8 rounded-lg ${
                        user.rank === 1
                          ? "bg-amber-500/30 text-amber-400"
                          : user.rank === 2
                            ? "bg-slate-400/30 text-slate-300"
                            : "bg-orange-600/30 text-orange-400"
                      }`}
                      whileHover={{ scale: 1.2 }}
                    >
                      {["🥇", "🥈", "🥉"][user.rank - 1]}
                    </motion.div>
                  ) : (
                    <span className="text-slate-400 font-semibold">#{user.rank}</span>
                  )}
                </div>

                {/* Avatar */}
                <Avatar className="w-10 h-10 border-2 border-slate-600">
                  <AvatarImage src={getUserAvatar(user)} alt={formatUserName(user)} />
                  <AvatarFallback>{formatUserName(user).charAt(0)}</AvatarFallback>
                </Avatar>

                {/* User Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-white">{formatUserName(user)}</p>
                    {getUserBadges(user).map((b) => (
                      <Badge key={b} variant="secondary" className="text-xs bg-cyan-600/30 text-cyan-300">
                        {b}
                      </Badge>
                    ))}
                  </div>
                  {user.mindshare_users?.wallet_address && (
                    <p className="text-xs text-slate-400">
                      {user.mindshare_users.wallet_address.slice(0, 6)}...{user.mindshare_users.wallet_address.slice(-4)}
                    </p>
                  )}
                </div>

                {/* Score */}
                <div className="text-right flex-shrink-0">
                  <p className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                    {user.mindshare_score.toLocaleString()}
                  </p>
                  <div className="flex items-center gap-1 justify-end text-xs text-emerald-400">
                    <TrendingUp className="w-3 h-3" />
                    <span>+{Math.floor(Math.random() * 100)}</span>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
