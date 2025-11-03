import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { validateJWT } from "@/lib/jwt-utils"

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  const publicPaths = ["/", "/auth/login", "/auth/signup", "/auth/callback"]

  if (publicPaths.some((p) => pathname === p || pathname.startsWith(p))) {
    return NextResponse.next()
  }

  const res = NextResponse.next()
  let isAuthenticated = false
  let userRole = "ambassador"
  let userEmail = ""

  // SINGLE AUTH CHECK: Prioritize JWT token (from backend API)
  const authToken = req.cookies.get("auth_token")?.value

  if (authToken) {
    const jwtValidation = validateJWT(authToken)

    if (jwtValidation.valid && jwtValidation.payload) {
      isAuthenticated = true
      userRole = jwtValidation.payload.role || "ambassador"
      userEmail = jwtValidation.payload.email || ""
      console.log("[Middleware] ✓ JWT auth - Email:", userEmail, "Role:", userRole, "Path:", pathname)
    } else {
      console.log("[Middleware] ✗ JWT token invalid or expired")
    }
  }

  // If no JWT, check Supabase session as fallback
  if (!isAuthenticated) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => req.cookies.getAll(),
          setAll: (cookiesToSet) => {
            cookiesToSet.forEach(({ name, value, options }) => {
              res.cookies.set(name, value, options)
            })
          },
        },
      },
    )

    const { data, error } = await supabase.auth.getUser()
    const user = data?.user

    if (user && !error) {
      isAuthenticated = true
      userRole = user.user_metadata?.role || "ambassador"
      userEmail = user.email || ""
      console.log("[Middleware] ✓ Supabase auth fallback - User:", userEmail, "Role:", userRole, "Path:", pathname)

      // Set headers for client-side auth context
      res.headers.set("x-user-authenticated", "true")
      res.headers.set("x-user-role", userRole)
      res.headers.set("x-user-email", userEmail)
    }
  }

  // If still not authenticated, redirect to login
  if (!isAuthenticated) {
    console.log("[Middleware] ✗ No authenticated user, redirecting to login. Path:", pathname)
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = "/auth/login"
    redirectUrl.searchParams.set("from", pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Set headers for client-side auth context (only if authenticated)
  res.headers.set("x-user-authenticated", "true")
  res.headers.set("x-user-role", userRole)
  res.headers.set("x-user-email", userEmail)

  // ROLE-BASED ROUTING: Only redirect if user is on wrong dashboard
  if (userRole === "moderator") {
    // Moderators should be on /admin, redirect if they're on /dashboard
    if (pathname.startsWith("/dashboard")) {
      console.log("[Middleware] Redirecting moderator from dashboard to /admin")
      const redirectUrl = new URL("/admin", req.url)
      return NextResponse.redirect(redirectUrl)
    }
  } else {
    // Ambassadors and others should be on /dashboard, redirect if they're on /admin
    if (pathname.startsWith("/admin")) {
      console.log("[Middleware] Redirecting ambassador from admin to /dashboard")
      const redirectUrl = new URL("/dashboard", req.url)
      return NextResponse.redirect(redirectUrl)
    }
  }

  return res
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/profile/:path*"],
}
