"use server"

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

// ==============================
// 🔹 Sign In
// ==============================
export async function signIn(email: string, password: string) {
  try {
    // Use Next.js API route
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
    const response = await fetch(`${baseUrl}/api/auth/signin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })

    const result = await response.json()

    if (!response.ok || result.error) {
      return {
        success: false,
        error: result.error || "Login failed",
      }
    }

    return {
      success: true,
      user: result.user,
      error: null,
    }
  } catch (error: any) {
    console.error("[signIn] Error:", error)
    return {
      success: false,
      error: error.message || "An error occurred during login",
    }
  }
}

// ==============================
// 🔹 Sign Up
// ==============================
export async function signUp(email: string, password: string, fullName?: string, role?: "ambassador" | "moderator") {
  try {
    // Use Next.js API route
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
    const response = await fetch(`${baseUrl}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        fullName: fullName || email.split("@")[0],
        role: role || "ambassador",
      }),
    })

    const result = await response.json()

    if (!response.ok || result.error) {
      return {
        success: false,
        error: result.error || "Signup failed",
      }
    }

    return {
      success: true,
      user: result.user,
      error: null,
    }
  } catch (error: any) {
    console.error("[signUp] Error:", error)
    return {
      success: false,
      error: error.message || "An error occurred during signup",
    }
  }
}

// ==============================
// 🔹 Sign Out
// ==============================
export async function signOut() {
  const cookieStore = await cookies()
  cookieStore.delete("auth_token")

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        },
      },
    },
  )

  await supabase.auth.signOut()
  return { success: true }
}

// ==============================
// 🔹 Get Current User (Perbaikan!)
// ==============================
export async function getCurrentUser() {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        },
      },
    },
  )

  const { data, error } = await supabase.auth.getUser()
  const user = data?.user

  if (!user || error) return null

  const role = user.user_metadata?.role || "ambassador"

  return {
    id: user.id,
    email: user.email,
    role,
    fullName: user.user_metadata?.fullName || user.email?.split("@")[0],
  }
}
