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

  const res = NextResponse.next({ request: { headers: req.headers } })

  // PRIORITAS 1: Check JWT token first (lebih reliable untuk backend auth)
  const authToken = req.cookies.get("auth_token")?.value
  
  if (authToken) {
    const jwtValidation = validateJWT(authToken)
    
    if (jwtValidation.valid && jwtValidation.payload) {
      // JWT valid, allow access
      const role = jwtValidation.payload.role || "ambassador"
      console.log("[Middleware] ✓ JWT auth - Email:", jwtValidation.payload.email, "Role:", role, "Path:", pathname)
      
      // Role-based routing for JWT users
      if (pathname.startsWith("/dashboard") && role === "moderator") {
        console.log("[Middleware] Redirecting moderator to /admin")
        const redirectUrl = req.nextUrl.clone()
        redirectUrl.pathname = "/admin"
        return NextResponse.redirect(redirectUrl)
      }

      if (pathname.startsWith("/admin") && role !== "moderator") {
        console.log("[Middleware] Redirecting non-moderator to /dashboard")
        const redirectUrl = req.nextUrl.clone()
        redirectUrl.pathname = "/dashboard"
        return NextResponse.redirect(redirectUrl)
      }

      return res
    } else {
      console.log("[Middleware] ✗ JWT token invalid or expired")
    }
  }

  // PRIORITAS 2: Try Supabase authentication as fallback
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
    const role = user.user_metadata?.role || "ambassador"
    console.log("[Middleware] ✓ Supabase auth - User:", user.email, "Role:", role, "Path:", pathname)

    // Role-based routing for Supabase users
    if (pathname.startsWith("/dashboard") && role === "moderator") {
      console.log("[Middleware] Redirecting moderator to /admin")
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = "/admin"
      return NextResponse.redirect(redirectUrl)
    }

    if (pathname.startsWith("/admin") && role !== "moderator") {
      console.log("[Middleware] Redirecting non-moderator to /dashboard")
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = "/dashboard"
      return NextResponse.redirect(redirectUrl)
    }

    return res
  }

  // No valid auth found
  console.log("[Middleware] ✗ No authenticated user, redirecting to login. Path:", pathname)
  const redirectUrl = req.nextUrl.clone()
  redirectUrl.pathname = "/auth/login"
  redirectUrl.searchParams.set("from", pathname)
  return NextResponse.redirect(redirectUrl)
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/profile/:path*"],
}
