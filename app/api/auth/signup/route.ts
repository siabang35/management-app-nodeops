import { type NextRequest, NextResponse } from "next/server"

const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, fullName, role } = body

    if (!email || !password) {
      return NextResponse.json({ success: false, error: "Email and password are required" }, { status: 400 })
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ success: false, error: "Invalid email format" }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ success: false, error: "Password must be at least 8 characters" }, { status: 400 })
    }

    // Forward request to backend API
    const backendResponse = await fetch(`${BACKEND_API_URL}/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
        fullName: fullName || email.split("@")[0],
        role: role || "ambassador",
      }),
    })

    const backendData = await backendResponse.json()

    if (!backendResponse.ok) {
      console.error("[API] Signup error from backend:", backendData)
      return NextResponse.json(
        {
          success: false,
          error: backendData.message || backendData.error || "Signup failed",
        },
        { status: backendResponse.status || 400 },
      )
    }

    const user = backendData.user
    if (!user) {
      return NextResponse.json({ success: false, error: "Invalid response from server" }, { status: 500 })
    }

    const userRole = user?.role || "ambassador"
    const token = backendData.token

    return NextResponse.json(
      {
        success: true,
        user: {
          id: user?.id,
          email: user?.email,
          role: userRole,
          fullName: user?.user_metadata?.fullName || fullName || email.split("@")[0],
        },
        token: token, // Include token in response for client to handle
        message: backendData.message || "Sign up successful",
        error: null,
      },
      { status: 201 },
    )
  } catch (error: any) {
    console.error("[API] Signup exception:", error)
    return NextResponse.json(
      { success: false, error: error.message || "An error occurred during signup" },
      { status: 500 },
    )
  }
}
