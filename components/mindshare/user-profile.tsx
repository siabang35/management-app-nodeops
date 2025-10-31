"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Copy, ExternalLink, Mail, Wallet } from "lucide-react"
import { useState } from "react"

export function UserProfile({ user }: any) {
  const [copied, setCopied] = useState("")

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopied(field)
    setTimeout(() => setCopied(""), 2000)
  }

  const profileData = {
    walletAddress: "0x742d35Cc6634C0532925a3b844Bc91e2c6e4e8d2",
    email: "user@nodeops.io",
    xHandle: "@nodeops_user",
    telegramId: "@nodeops_tg",
    discordId: "NodeOpsUser#0001",
    discordUsername: "NodeOpsUser",
    promoCode: "NODEOPS2024",
    discordInvite: "https://discord.gg/nodeops",
  }

  return (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Profile Header */}
      <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 overflow-hidden">
        <CardContent className="p-0">
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 h-20"></div>
          <div className="relative px-6 pb-6">
            <motion.div className="flex flex-col items-center -mt-12 mb-4" whileHover={{ scale: 1.05 }}>
              <Avatar className="w-24 h-24 border-4 border-slate-900">
                <AvatarImage src="/placeholder-user.jpg" alt={user.name} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
            </motion.div>
            <div className="text-center">
              <h2 className="text-xl font-bold text-white">{user.name}</h2>
              <p className="text-sm text-cyan-400">Rank #{user.rank}</p>
              <div className="mt-2 flex justify-center gap-1 flex-wrap">
                {user.badge.map((b: string) => (
                  <Badge key={b} className="bg-emerald-600/30 text-emerald-300">
                    {b}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Details */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-lg">Profile Information</CardTitle>
          <CardDescription>Non-editable personal details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Wallet */}
          <motion.div
            className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors"
            whileHover={{ x: 4 }}
          >
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-blue-400" />
              <span className="text-slate-300 text-sm">Wallet</span>
            </div>
            <motion.button
              onClick={() => copyToClipboard(profileData.walletAddress, "wallet")}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              whileHover={{ scale: 1.05 }}
            >
              {copied === "wallet" ? "Copied!" : "Copy"}
              <Copy className="w-3 h-3" />
            </motion.button>
          </motion.div>

          {/* Email */}
          <motion.div
            className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors"
            whileHover={{ x: 4 }}
          >
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-emerald-400" />
              <span className="text-slate-300 text-sm">Email</span>
            </div>
            <motion.button
              onClick={() => copyToClipboard(profileData.email, "email")}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              whileHover={{ scale: 1.05 }}
            >
              {copied === "email" ? "Copied!" : "Copy"}
              <Copy className="w-3 h-3" />
            </motion.button>
          </motion.div>

          {/* X Handle */}
          <motion.div className="p-3 bg-slate-700/30 rounded-lg" whileHover={{ x: 4 }}>
            <p className="text-xs text-slate-400 mb-1">X / Twitter</p>
            <p className="text-sm text-white">{profileData.xHandle}</p>
          </motion.div>

          {/* Telegram */}
          <motion.div className="p-3 bg-slate-700/30 rounded-lg" whileHover={{ x: 4 }}>
            <p className="text-xs text-slate-400 mb-1">Telegram</p>
            <p className="text-sm text-white">{profileData.telegramId}</p>
          </motion.div>

          {/* Discord */}
          <motion.div className="p-3 bg-slate-700/30 rounded-lg" whileHover={{ x: 4 }}>
            <p className="text-xs text-slate-400 mb-1">Discord</p>
            <p className="text-sm text-white">{profileData.discordUsername}</p>
          </motion.div>
        </CardContent>
      </Card>

      {/* Promo & Discord */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-lg">Community</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Promo Code */}
          <div>
            <p className="text-xs text-slate-400 mb-2">Promo Code</p>
            <motion.div className="flex items-center gap-2" whileHover={{ scale: 1.02 }}>
              <input
                type="text"
                value={profileData.promoCode}
                readOnly
                className="flex-1 px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(profileData.promoCode, "promo")}
                className="border-slate-600"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </motion.div>
          </div>

          {/* Discord Invite */}
          <div>
            <p className="text-xs text-slate-400 mb-2">Discord Server</p>
            <motion.a
              href={profileData.discordInvite}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white rounded-lg transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ExternalLink className="w-4 h-4" />
              Join Discord
            </motion.a>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
