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

    const userRole = role || "ambassador"
    const userName = fullName || email.split("@")[0]

    // Sign up with Supabase
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: userRole,
          fullName: userName,
        },
      },
    })

    if (error || !data.user) {
      console.error("[API] Signup error:", error)
      return NextResponse.json(
        { success: false, error: error?.message || "Signup failed" },
        { status: 400 }
      )
    }

    const user = data.user

    console.log("[API] Signup success - User:", user.email, "Role:", userRole)

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: userRole,
        fullName: userName,
      },
      message: "Account created successfully",
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
