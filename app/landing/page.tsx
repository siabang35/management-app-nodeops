"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Loader2, Shield, Users, User, Crown } from "lucide-react"
import { Card } from "@/components/ui/card"

export default function LandingPage() {
  const { user, loading, isAdmin, isModerator, isAmbassador } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      // Role-based redirection
      if (isAdmin) {
        router.replace("/admin")
      } else if (isModerator) {
        router.replace("/moderator")
      } else if (isAmbassador) {
        router.replace("/ambassador")
      } else {
        router.replace("/dashboard")
      }
    } else if (!loading && !user) {
      // Not authenticated, redirect to login
      router.replace("/auth/login")
    }
  }, [user, loading, isAdmin, isModerator, isAmbassador, router])

  // Show loading state while determining role
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
          <h2 className="text-xl font-semibold text-white mb-2">Setting up your workspace...</h2>
          <p className="text-slate-400">Please wait while we configure your dashboard</p>
        </div>
      </div>
    )
  }

  // Show role selection if user is authenticated but no specific role detected
  if (user && !isAdmin && !isModerator && !isAmbassador) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Welcome to NodeOps</h1>
            <p className="text-slate-400">Choose your workspace to get started</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="p-6 bg-slate-800/50 border-slate-700 hover:border-primary/50 cursor-pointer transition-all group">
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:animate-glow-pulse">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-white mb-2">Admin Dashboard</h3>
                <p className="text-sm text-slate-400 mb-4">Full system access and management</p>
                <button
                  onClick={() => router.push("/admin")}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white py-2 px-4 rounded-lg font-medium transition-all"
                >
                  Access Admin
                </button>
              </div>
            </Card>

            <Card className="p-6 bg-slate-800/50 border-slate-700 hover:border-primary/50 cursor-pointer transition-all group">
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:animate-glow-pulse">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-white mb-2">Moderator Dashboard</h3>
                <p className="text-sm text-slate-400 mb-4">Team and project management</p>
                <button
                  onClick={() => router.push("/moderator")}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-2 px-4 rounded-lg font-medium transition-all"
                >
                  Access Moderator
                </button>
              </div>
            </Card>

            <Card className="p-6 bg-slate-800/50 border-slate-700 hover:border-primary/50 cursor-pointer transition-all group">
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:animate-glow-pulse">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-white mb-2">Ambassador Dashboard</h3>
                <p className="text-sm text-slate-400 mb-4">Community engagement and rewards</p>
                <button
                  onClick={() => router.push("/ambassador")}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white py-2 px-4 rounded-lg font-medium transition-all"
                >
                  Access Ambassador
                </button>
              </div>
            </Card>

            <Card className="p-6 bg-slate-800/50 border-slate-700 hover:border-primary/50 cursor-pointer transition-all group">
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:animate-glow-pulse">
                  <Crown className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-white mb-2">Member Dashboard</h3>
                <p className="text-sm text-slate-400 mb-4">Task management and collaboration</p>
                <button
                  onClick={() => router.push("/dashboard")}
                  className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white py-2 px-4 rounded-lg font-medium transition-all"
                >
                  Access Dashboard
                </button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  // Fallback loading state
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
        <h2 className="text-xl font-semibold text-white mb-2">Redirecting...</h2>
        <p className="text-slate-400">Taking you to your dashboard</p>
      </div>
    </div>
  )
}
