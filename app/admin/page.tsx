"use client"

import { useAuth } from "@/lib/auth-context"
import ModeratorDashboard from "@/components/dashboard/ModeratorDashboard"

export default function AdminPage() {
  const { user, isModerator, loading: authLoading } = useAuth()

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-cyan-500 border-r-transparent"></div>
          <p className="mt-4 text-slate-400">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  // If user is not authenticated or not a moderator, middleware will handle redirect
  if (!user || !isModerator) {
    return null // This shouldn't happen due to middleware, but safety check
  }

  return <ModeratorDashboard />
}
