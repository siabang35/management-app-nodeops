"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Medal, TrendingUp } from "lucide-react"

const leaderboardData = Array.from({ length: 25 }, (_, i) => ({
  rank: i + 1,
  name: `User ${i + 1}`,
  score: 10000 - i * 350,
  avatar: `/placeholder-user.jpg`,
  badge: i < 3 ? ["Top Contributor"] : i < 10 ? ["Active"] : [],
  change: i % 2 === 0 ? "up" : "down",
  trend: (i % 5) + 1,
}))

export function Leaderboard({ onSelectUser }: any) {
  return (
    <Card className="bg-slate-800/50 border-slate-700 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-amber-600/20 to-yellow-600/20 border-b border-slate-700">
        <CardTitle className="text-white flex items-center gap-2">
          <Medal className="w-6 h-6 text-amber-400" />
          Top 25 Contributors
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-1 max-h-[600px] overflow-y-auto">
          {leaderboardData.map((user, index) => (
            <motion.button
              key={user.rank}
              onClick={() => onSelectUser(user)}
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
                <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>

              {/* User Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-white">{user.name}</p>
                  {user.badge.map((b) => (
                    <Badge key={b} variant="secondary" className="text-xs bg-cyan-600/30 text-cyan-300">
                      {b}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Score */}
              <div className="text-right flex-shrink-0">
                <p className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                  {user.score.toLocaleString()}
                </p>
                <div className="flex items-center gap-1 justify-end text-xs text-emerald-400">
                  <TrendingUp className="w-3 h-3" />
                  <span>+{user.trend * 50}</span>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
