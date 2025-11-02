"use client"

import { useAuth } from "@/lib/auth-context"
import AmbassadorDashboard from "@/components/dashboard/AmbassadorDashboard"
import ModeratorDashboard from "@/components/dashboard/ModeratorDashboard"

export default function DashboardPage() {
  const { user, isAmbassador, isModerator, loading: authLoading } = useAuth()

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-cyan-500 border-r-transparent"></div>
          <p className="mt-4 text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  // If user is not authenticated, middleware will handle redirect
  if (!user) {
    return null // This shouldn't happen due to middleware, but safety check
  }

  // Render appropriate dashboard based on user role
  if (isModerator) {
    return <ModeratorDashboard />
  }

  // Default to AmbassadorDashboard for ambassadors and other roles
  return <AmbassadorDashboard />
}
