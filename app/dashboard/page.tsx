"use client"

import { useAuth } from "@/lib/auth-context"
import AmbassadorDashboard from "@/components/dashboard/AmbassadorDashboard"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function DashboardPage() {
  const { user, isAmbassador, isModerator, loading: authLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (authLoading) return

    // Role-based routing: moderators should go to /admin
    if (user && isModerator && !isAmbassador) {
      console.log("[Dashboard] Redirecting moderator to /admin")
      router.replace("/admin")
    }
  }, [user, isModerator, isAmbassador, authLoading, router])

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-cyan-500 border-r-transparent"></div>
          <p className="mt-4 text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  // If user is not authenticated, middleware will handle redirect
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-slate-200 mb-2">Authentication Required</h2>
          <p className="text-slate-400">Please log in to access your dashboard.</p>
        </div>
      </div>
    )
  }

  // Only render AmbassadorDashboard for ambassadors (moderators are redirected above)
  if (isAmbassador) {
    return <AmbassadorDashboard />
  }

  // Fallback for other roles or edge cases
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-slate-200 mb-2">Access Restricted</h2>
        <p className="text-slate-400">Your account role is not authorized to access this dashboard.</p>
        <p className="text-sm text-slate-500 mt-2">Role: {user.role}</p>
      </div>
    </div>
  )
}
