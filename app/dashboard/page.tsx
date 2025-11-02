"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import ModeratorDashboard from "@/components/dashboard/ModeratorDashboard"
import AmbassadorDashboard from "@/components/dashboard/AmbassadorDashboard"

export default function DashboardPage() {
  const router = useRouter()
  const [role, setRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser()

      if (error || !data?.user) {
        console.warn("No Supabase session found:", error)
        router.replace("/auth/login")
        return
      }

      const userRole = data.user.user_metadata?.role || "ambassador"
      setRole(userRole)
      setLoading(false)
    }

    fetchUser()
  }, [router])

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center text-slate-400">
        Loading dashboard...
      </div>
    )

  return role === "moderator" ? <ModeratorDashboard /> : <AmbassadorDashboard />
}
