"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import AmbassadorDashboard from "@/components/dashboard/AmbassadorDashboard"
import ModeratorDashboard from "@/components/dashboard/ModeratorDashboard"

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [role, setRole] = useState<"ambassador" | "moderator" | null>(null)

  useEffect(() => {
    const checkAuthAndRole = () => {
      console.log("[Dashboard] Checking authentication and role...")

      // Ambil cookies
      const cookies = document.cookie.split(";")
      const hasAuthToken = cookies.some((c) => c.trim().startsWith("auth_token="))
      const hasSupabaseSession = cookies.some((c) => c.trim().includes("sb-"))

      // Jika tidak ada sesi auth → redirect ke login
      if (!hasAuthToken && !hasSupabaseSession) {
        console.warn("[Dashboard] ✗ No auth session found, redirecting to /auth/login")
        router.replace("/auth/login")
        return
      }

      // Coba baca role dari header yang diset middleware (via meta tag)
      // atau fallback ke localStorage
      const userRole =
        localStorage.getItem("user_role") ||
        document?.querySelector("meta[name='x-user-role']")?.getAttribute("content") ||
        "ambassador"

      console.log("[Dashboard] ✓ Authenticated as:", userRole)
      setRole(userRole as "ambassador" | "moderator")
      setLoading(false)
    }

    const timer = setTimeout(checkAuthAndRole, 150)
    return () => clearTimeout(timer)
  }, [router])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-cyan-500 border-r-transparent"></div>
          <p className="mt-4 text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  // Render berdasarkan role
  if (role === "moderator") {
    return <ModeratorDashboard />
  }

  // Default ke AmbassadorDashboard
  return <AmbassadorDashboard />
}
