import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  const publicPaths = ["/", "/auth/login", "/auth/signup", "/auth/callback"]

  if (publicPaths.some((p) => pathname === p || pathname.startsWith(p))) {
    return NextResponse.next()
  }

  const res = NextResponse.next({ request: { headers: req.headers } })

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

  if (!user || error) {
    console.log("[v0] No authenticated user, redirecting to login")
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = "/auth/login"
    redirectUrl.searchParams.set("from", pathname)
    return NextResponse.redirect(redirectUrl)
  }

  const role = user.user_metadata?.role || "ambassador"
  console.log("[v0] Middleware - User:", user.email, "Role:", role, "Path:", pathname)

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
