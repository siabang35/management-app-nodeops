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
        console.log("[Dashboard] Starting auth check...")

        // PENTING: Cek JWT token dulu sebelum Supabase
        // Karena middleware sudah validasi JWT, jika sampai sini berarti authorized
        const cookies = document.cookie.split(';')
        const authTokenCookie = cookies.find(c => c.trim().startsWith('auth_token='))
        
        if (authTokenCookie) {
          console.log("[Dashboard] JWT token found, user is authenticated")
          setAuthorized(true)
          setLoading(false)
          return
        }

        // Retry mechanism untuk Supabase session dengan backoff
        let retries = 3
        let delay = 300
        let sessionData = null

        for (let i = 0; i < retries; i++) {
          console.log(`[Dashboard] Checking Supabase session (attempt ${i + 1}/${retries})...`)
          await new Promise(resolve => setTimeout(resolve, delay))
          
          const { data } = await supabase.auth.getSession()
          if (data?.session) {
            sessionData = data
            console.log("[Dashboard] Supabase session found!")
            break
          }
          
          delay *= 1.5 // Exponential backoff
        }

        if (!sessionData?.session) {
          console.warn("[Dashboard] No session found after retries, redirecting to login")
          router.replace("/auth/login")
          return
        }

        const { data, error } = await supabase.auth.getUser()

        if (error || !data?.user) {
          console.warn("[Dashboard] Error getting user:", error)
          router.replace("/auth/login")
          return
        }

        const userRole = data.user.user_metadata?.role || "ambassador"
        console.log("[Dashboard] User authenticated:", data.user.email, "Role:", userRole)

        // Redirect moderators to admin page
        if (userRole === "moderator") {
          console.log("[Dashboard] Moderator detected, redirecting to admin")
          router.replace("/admin")
          return
        }

        setAuthorized(true)
        setLoading(false)
      } catch (error) {
        console.error("[Dashboard] Auth check failed:", error)
        
        // Last resort: Check if JWT token exists
        const cookies = document.cookie.split(';')
        const authTokenCookie = cookies.find(c => c.trim().startsWith('auth_token='))
        
        if (authTokenCookie) {
          console.log("[Dashboard] JWT token found in error handler, allowing access")
          setAuthorized(true)
          setLoading(false)
          return
        }
        
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