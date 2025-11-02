import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, fullName, role } = body

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      )
    }

    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (cookiesToSet) => {
            cookiesToSet.forEach(({ name, value, options }) => 
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    // Sign up with Supabase
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo:
          process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
          `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/callback`,
        data: { 
          role: role || "ambassador", 
          fullName: fullName || email.split("@")[0] 
        },
      },
    })

    if (error) {
      console.error("[API] Signup error:", error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }

    const user = data?.user
    const userRole = user?.user_metadata?.role || "ambassador"

    return NextResponse.json({
      success: true,
      user: {
        id: user?.id,
        email: user?.email,
        role: userRole,
        fullName: user?.user_metadata?.fullName,
      },
      error: null,
    })
  } catch (error: any) {
    console.error("[API] Signup exception:", error)
    return NextResponse.json(
      { success: false, error: error.message || "An error occurred during signup" },
      { status: 500 }
    )
  }
}
