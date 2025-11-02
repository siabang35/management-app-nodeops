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

  // Try Supabase authentication first
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
  let user = data?.user
  let role = user?.user_metadata?.role || "ambassador"

  // Fallback: Check JWT token if Supabase auth fails
  if (!user || error) {
    const authToken = req.cookies.get("auth_token")?.value
    
    if (authToken) {
      const jwtValidation = validateJWT(authToken)
      
      if (jwtValidation.valid && jwtValidation.payload) {
        // JWT valid, allow access
        role = jwtValidation.payload.role || "ambassador"
        console.log("[Middleware] Using JWT auth - Email:", jwtValidation.payload.email, "Role:", role, "Path:", pathname)
        
        // Role-based routing for JWT users
        if (pathname.startsWith("/dashboard") && role === "moderator") {
          const redirectUrl = req.nextUrl.clone()
          redirectUrl.pathname = "/admin"
          return NextResponse.redirect(redirectUrl)
        }

        if (pathname.startsWith("/admin") && role !== "moderator") {
          const redirectUrl = req.nextUrl.clone()
          redirectUrl.pathname = "/dashboard"
          return NextResponse.redirect(redirectUrl)
        }

        return res
      }
    }

    // No valid auth found
    console.log("[Middleware] No authenticated user, redirecting to login")
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = "/auth/login"
    redirectUrl.searchParams.set("from", pathname)
    return NextResponse.redirect(redirectUrl)
  }

  console.log("[Middleware] Supabase auth - User:", user.email, "Role:", role, "Path:", pathname)

  // Role-based routing for Supabase users
  if (pathname.startsWith("/dashboard") && role === "moderator") {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = "/admin"
    return NextResponse.redirect(redirectUrl)
  }

  if (pathname.startsWith("/admin") && role !== "moderator") {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = "/dashboard"
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/profile/:path*"],
}
