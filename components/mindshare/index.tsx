"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import { motion } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Leaderboard } from "./leaderboard"
import { UserProfile } from "./user-profile"
import { WalletConnection } from "./wallet-connection"
import { AmbassadorActivity } from "./ambassador-activity"
import { Trophy } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export function Mindshare() {
  const { user, loading: authLoading } = useAuth()
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [connectedWallets, setConnectedWallets] = useState<Array<{ address: string; networkName: string }>>([])

  // Memoize user ID to prevent unnecessary re-renders
  const userId = useMemo(() => user?.id || "", [user?.id])

  // Memoized event handlers to prevent unnecessary re-renders
  const handleWalletConnected = useCallback((wallet: any) => {
    setConnectedWallets(prev => {
      // Prevent duplicate wallets
      const exists = prev.some(w => w.address === wallet.address)
      if (exists) return prev
      return [...prev, { address: wallet.address, networkName: wallet.networkName }]
    })
  }, [])

  const handleWalletDisconnected = useCallback((address: string) => {
    setConnectedWallets(prev => prev.filter(wallet => wallet.address !== address))
  }, [])

  // Load connected wallets when user changes
  useEffect(() => {
    if (userId) {
      // Reset connected wallets when user changes
      setConnectedWallets([])
    }
  }, [userId])

  // Show loading state while auth is loading
  if (authLoading) {
    return (
      <div className="p-8 space-y-8 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading ambassador program...</p>
        </div>
      </div>
    )
  }

  // Show auth required message if not authenticated
  if (!user) {
    return (
      <div className="p-8 space-y-8 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 min-h-screen flex items-center justify-center">
        <Alert className="max-w-md border-yellow-500/50 bg-yellow-500/10">
          <AlertCircle className="h-4 w-4 text-yellow-400" />
          <AlertDescription className="text-yellow-300">
            Please sign in to access the Mindshare Ambassador Program.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

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
          <h1 className="text-4xl font-bold text-white">Mindshare Ambassador Program</h1>
          <p className="text-slate-400">Connect your Web3 wallet, track activities, and earn points in the ambassador program</p>
        </div>
      </motion.div>

      <Tabs defaultValue="leaderboard" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-slate-800/50 border-slate-700">
          <TabsTrigger value="leaderboard" className="data-[state=active]:bg-cyan-600/20">
            Leaderboard
          </TabsTrigger>
          <TabsTrigger value="wallet" className="data-[state=active]:bg-cyan-600/20">
            Wallet
          </TabsTrigger>
          <TabsTrigger value="activity" className="data-[state=active]:bg-cyan-600/20">
            Activity
          </TabsTrigger>
          <TabsTrigger value="profile" className="data-[state=active]:bg-cyan-600/20">
            Profile
          </TabsTrigger>
        </TabsList>

        <TabsContent value="leaderboard" className="mt-6">
          <Leaderboard onSelectUser={setSelectedUser} />
        </TabsContent>

        <TabsContent value="wallet" className="mt-6">
          <WalletConnection
            userId={userId}
            onWalletConnected={handleWalletConnected}
            onWalletDisconnected={handleWalletDisconnected}
          />
        </TabsContent>

        <TabsContent value="activity" className="mt-6">
          <AmbassadorActivity
            userId={userId}
            wallets={connectedWallets}
          />
        </TabsContent>

        <TabsContent value="profile" className="mt-6">
          {selectedUser ? (
            <UserProfile user={selectedUser} />
          ) : (
            <div className="text-center py-12 text-slate-400">
              Select a user from the leaderboard to view their profile details
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
