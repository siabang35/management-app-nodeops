"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import AmbassadorDashboard from "@/components/dashboard/AmbassadorDashboard"

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Tunggu session siap
        const { data: sessionData } = await supabase.auth.getSession()

        if (!sessionData?.session) {
          console.warn("No active session found")
          router.replace("/auth/login")
          return
        }

        const { data, error } = await supabase.auth.getUser()

        if (error || !data?.user) {
          console.warn("Error getting user:", error)
          router.replace("/auth/login")
          return
        }

        const userRole = data.user.user_metadata?.role || "ambassador"
        console.log("Dashboard - User:", data.user.email, "Role:", userRole)

        // Redirect moderators to admin page
        if (userRole === "moderator") {
          console.log("Moderator detected, redirecting to admin")
          router.replace("/admin")
          return
        }

        setAuthorized(true)
        setLoading(false)
      } catch (error) {
        console.error("Auth check failed:", error)
        router.replace("/auth/login")
      }
    }

    checkAuth()
  }, [router])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-slate-400">
        Loading dashboard...
      </div>
    )
  }

  if (!authorized) {
    return (
      <div className="flex h-screen items-center justify-center text-slate-400">
        Redirecting...
      </div>
    )
  }

  return <AmbassadorDashboard />
}