"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import ModeratorDashboard from "@/components/dashboard/ModeratorDashboard"

export default function AdminPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Middleware sudah handle authentication dan role-based routing
    // Jika user sampai ke halaman ini, berarti sudah authenticated dan role = moderator
    // Kita hanya perlu simple check untuk memastikan cookie ada
    
    const checkAuth = () => {
      console.log("[Admin] Checking authentication...")
      
      // Simple check: apakah ada auth token atau supabase session
      const cookies = document.cookie.split(';')
      const hasAuthToken = cookies.some(c => c.trim().startsWith('auth_token='))
      const hasSupabaseSession = cookies.some(c => c.trim().includes('sb-'))
      
      if (hasAuthToken || hasSupabaseSession) {
        console.log("[Admin] ✓ Moderator authenticated (middleware validated)")
        setLoading(false)
        return
      }
      
      // Jika tidak ada cookie sama sekali, redirect ke login
      console.warn("[Admin] ✗ No auth cookies found, redirecting to login")
      router.replace("/auth/login")
    }

    // Small delay untuk memastikan cookies sudah ter-set setelah redirect dari login
    const timer = setTimeout(checkAuth, 100)
    
    return () => clearTimeout(timer)
  }, [router])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-cyan-500 border-r-transparent"></div>
          <p className="mt-4 text-slate-400">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  return <ModeratorDashboard />
}
