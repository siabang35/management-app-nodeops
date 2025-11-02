import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      )
    }

    const cookieStore = await cookies()

    // Create Supabase client with cookie handling
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

    // Sign in with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error || !data.user) {
      console.error("[API] Signin error:", error)
      return NextResponse.json(
        { success: false, error: error?.message || "Login failed" },
        { status: 401 }
      )
    }

    const user = data.user
    const role = user.user_metadata?.role || "ambassador"

    console.log("[API] Signin success - User:", user.email, "Role:", role)

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role,
        fullName: user.user_metadata?.fullName || user.email?.split("@")[0],
      },
      error: null,
    })
  } catch (error: any) {
    console.error("[API] Signin exception:", error)
    return NextResponse.json(
      { success: false, error: error.message || "An error occurred during signin" },
      { status: 500 }
    )
  }
}
