"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Leaderboard } from "./leaderboard"
import { UserProfile } from "./user-profile"
import { Card, CardContent } from "@/components/ui/card"
import { Trophy } from "lucide-react"

export function Mindshare() {
  const [selectedUser, setSelectedUser] = useState<any>(null)

  return (
    <div className="p-8 space-y-8 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 min-h-screen">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-3 mb-8"
      >
        <div className="p-3 bg-gradient-to-br from-amber-600 to-yellow-500 rounded-lg">
          <Trophy className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-4xl font-bold text-white">Mindshare Leaderboard</h1>
          <p className="text-slate-400">Top 25 Contributors & Community Members</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Leaderboard */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Leaderboard onSelectUser={setSelectedUser} />
        </motion.div>

        {/* User Profile */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {selectedUser ? (
            <UserProfile user={selectedUser} />
          ) : (
            <Card className="bg-slate-800/50 border-slate-700 h-full flex items-center justify-center">
              <CardContent className="text-center py-12">
                <p className="text-slate-400">Select a user to view profile details</p>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  )
}
