import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"

const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

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

    const userRole = role || "ambassador"
    const displayName = fullName || email.split("@")[0]

    // Forward request to backend API
    const backendResponse = await fetch(`${BACKEND_API_URL}/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
        fullName: displayName,
        role: userRole,
      }),
    })

    const backendData = await backendResponse.json()

    if (!backendResponse.ok) {
      console.error("[API] Signup error from backend:", backendData)
      return NextResponse.json(
        { success: false, error: backendData.message || "Signup failed" },
        { status: backendResponse.status }
      )
    }

    // Store backend token in cookie
    const cookieStore = await cookies()
    if (backendData.token) {
      cookieStore.set("auth_token", backendData.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24, // 24 hours
        path: "/",
      })
    }

    // Extract user data from backend response
    const user = backendData.user

    // Create Supabase session for client-side authentication
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

    // Create Supabase user with same credentials
    const { data: supabaseAuth, error: supabaseError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: user?.role || userRole,
          fullName: user?.user_metadata?.fullName || user?.fullName || displayName,
        },
      },
    })

    if (supabaseError) {
      console.error("[API] Supabase signup error:", supabaseError)
      // Continue without Supabase session - backend auth was successful
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user?.id,
        email: user?.email,
        role: user?.role || userRole,
        fullName: user?.user_metadata?.fullName || user?.fullName || displayName,
      },
      message: backendData.message,
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