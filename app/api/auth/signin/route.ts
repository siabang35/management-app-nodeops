import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"

const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

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

    // Forward request to backend API
    const backendResponse = await fetch(`${BACKEND_API_URL}/auth/signin`,{  
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })

    const backendData = await backendResponse.json()

    if (!backendResponse.ok) {
      console.error("[API] Signin error from backend:", backendData)
      return NextResponse.json(
        { success: false, error: backendData.message || "Login failed" },
        { status: backendResponse.status }
      )
    }

    // Store token in cookie
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
    const role = user?.role || "ambassador"

    // PENTING: Buat Supabase session juga untuk sinkronisasi
    // Ini akan membuat middleware dan dashboard pages bisa menggunakan Supabase auth
    try {
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

      // Login ke Supabase dengan credentials yang sama
      const { error: supabaseError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (supabaseError) {
        console.warn("[API] Supabase signin warning:", supabaseError.message)
        // Tidak return error, karena backend login sudah sukses
        // Supabase session optional
      } else {
        console.log("[API] Supabase session created successfully")
      }
    } catch (supabaseErr) {
      console.warn("[API] Supabase signin exception:", supabaseErr)
      // Continue, karena backend auth sudah sukses
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user?.id,
        email: user?.email,
        role,
        fullName: user?.user_metadata?.fullName || user?.email?.split("@")[0],
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

