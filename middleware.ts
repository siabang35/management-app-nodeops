import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Public paths that don't require authentication
  const publicPaths = ["/", "/auth/login", "/auth/signup", "/auth/callback"]

  if (publicPaths.some((p) => pathname === p || pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // Create response object
  let response = NextResponse.next({
    request: {
      headers: req.headers,
    },
  })

  // Create Supabase client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    },
  )

  // Get user session
  const { data, error } = await supabase.auth.getUser()
  const user = data?.user

  console.log("[Middleware] Path:", pathname)
  console.log("[Middleware] User:", user?.email || "none")
  console.log("[Middleware] Error:", error?.message || "none")

  // Redirect to login if no user
  if (!user || error) {
    console.log("[Middleware] No authenticated user, redirecting to login")
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = "/auth/login"
    redirectUrl.searchParams.set("from", pathname)
    return NextResponse.redirect(redirectUrl)
  }

  const role = user.user_metadata?.role || "ambassador"
  console.log("[Middleware] User role:", role)

  // Role-based routing
  if (pathname.startsWith("/dashboard") && role === "moderator") {
    console.log("[Middleware] Moderator accessing dashboard, redirecting to admin")
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = "/admin"
    return NextResponse.redirect(redirectUrl)
  }

  if (pathname.startsWith("/admin") && role !== "moderator") {
    console.log("[Middleware] Non-moderator accessing admin, redirecting to dashboard")
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = "/dashboard"
    return NextResponse.redirect(redirectUrl)
  }

  console.log("[Middleware] Access granted")
  return response
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/profile/:path*"],
}
