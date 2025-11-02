import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import AmbassadorDashboard from "@/components/dashboard/AmbassadorDashboard"

export default async function DashboardPage() {
  const cookieStore = await cookies()

  // Create Supabase client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        },
      },
    }
  )

  // Get user session
  const { data, error } = await supabase.auth.getUser()

  if (error || !data?.user) {
    console.log("[Dashboard] No user session, redirecting to login")
    redirect("/auth/login")
  }

  const userRole = data.user.user_metadata?.role || "ambassador"

  // Redirect moderators to admin page
  if (userRole === "moderator") {
    console.log("[Dashboard] Moderator detected, redirecting to admin")
    redirect("/admin")
  }

  console.log("[Dashboard] Rendering for ambassador:", data.user.email)

  return <AmbassadorDashboard />
}
