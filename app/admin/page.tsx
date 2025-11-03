"use client"

import { useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import ModeratorDashboard from "@/components/dashboard/ModeratorDashboard"

export default function AdminPage() {
  const { loading, isModerator } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // If not loading and not a moderator, redirect to dashboard
    if (!loading && !isModerator) {
      console.log("[Admin] Non-moderator accessing admin, redirecting to dashboard")
      router.push("/dashboard")
    }
  }, [loading, isModerator, router])

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    )
  }

  // Only render if user is moderator
  if (!isModerator) {
    return null
  }

  return <ModeratorDashboard />
}
