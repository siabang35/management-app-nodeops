"use server"

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

// ==============================
// 🔹 Sign In (Perbaikan utama!)
// ==============================
export async function signIn(email: string, password: string) {
  try {
    if (API_BASE_URL) {
      const response: any = await fetch(`${API_BASE_URL}/auth/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      }).then((res) => res.json())

      if (response.token) {
        const cookieStore = await cookies()
        cookieStore.set("auth_token", response.token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 24,
        })
      }

      return {
        success: true,
        user: {
          id: response.user?.id,
          email: response.user?.email,
          role: response.user?.role || "ambassador",
        },
        error: response.error || null,
      }
    }
  } catch (error) {
    console.warn("[signIn] Backend API failed, falling back to Supabase")
  }

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

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  const user = data?.user
  const role = user?.user_metadata?.role || "ambassador"

  return {
    success: true,
    user: {
      id: user?.id,
      email: user?.email,
      role,
    },
    error: null,
  }
}

// ==============================
// 🔹 Sign Up
// ==============================
export async function signUp(email: string, password: string, fullName?: string, role?: "ambassador" | "moderator") {
  try {
    if (API_BASE_URL) {
      const response: any = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          fullName: fullName || email.split("@")[0],
          role: role || "ambassador",
        }),
      }).then((res) => res.json())

      if (response.token) {
        const cookieStore = await cookies()
        cookieStore.set("auth_token", response.token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 24,
        })
      }

      return {
        success: true,
        user: {
          id: response.user?.id,
          email: response.user?.email,
          role: response.user?.role || "ambassador",
        },
        error: response.error || null,
      }
    }
  } catch (error) {
    console.warn("[signUp] Backend API failed, falling back to Supabase")
  }

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

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo:
        process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
        `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/callback`,
      data: { role: role || "ambassador", fullName },
    },
  })

  if (error) {
    return { success: false, error: error.message }
  }

  const user = data?.user
  const userRole = user?.user_metadata?.role || "ambassador"

  return {
    success: true,
    user: {
      id: user?.id,
      email: user?.email,
      role: userRole,
    },
    error: null,
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
