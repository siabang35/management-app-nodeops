"use server"

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { serverApiClient } from "@/lib/server-api"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

export async function getMindshareLeaderboard(limit = 25) {
  try {
    if (API_BASE_URL) {
      return await serverApiClient.get(`/mindshare/leaderboard?limit=${limit}`)
    }
  } catch (error) {
    console.warn("[getMindshareLeaderboard] Backend API failed, falling back to Supabase")
  }

  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch (error) {
            console.error("Error setting cookies:", error)
          }
        },
      },
    },
  )

  try {
    const { data, error } = await supabase
      .from("mindshare_leaderboard")
      .select(
        `
        *,
        mindshare_users (
          id,
          user_id,
          wallet_address,
          email,
          x_handle,
          telegram_id,
          discord_id,
          discord_username,
          profile_avatar_url,
          mindshare_score,
          rank
        )
      `,
      )
      .order("current_rank", { ascending: true })
      .limit(limit)

    if (error) throw error
    return { data, error: null }
  } catch (error: any) {
    return { data: null, error: error.message }
  }
}

export async function getMindshareUserProfile(userId: string) {
  try {
    if (API_BASE_URL) {
      return await serverApiClient.get(`/mindshare/profile/${userId}`)
    }
  } catch (error) {
    console.warn("[getMindshareUserProfile] Backend API failed, falling back to Supabase")
  }

  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch (error) {
            console.error("Error setting cookies:", error)
          }
        },
      },
    },
  )

  try {
    const { data, error } = await supabase.from("mindshare_users").select("*").eq("user_id", userId).single()

    if (error) throw error
    return { data, error: null }
  } catch (error: any) {
    return { data: null, error: error.message }
  }
}

export async function updateMindshareScore(userId: string, pointsEarned: number) {
  try {
    if (API_BASE_URL) {
      return await serverApiClient.patch(`/mindshare/score/${userId}`, { points: pointsEarned })
    }
  } catch (error) {
    console.warn("[updateMindshareScore] Backend API failed, falling back to Supabase")
  }

  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch (error) {
            console.error("Error setting cookies:", error)
          }
        },
      },
    },
  )

  try {
    const { data: user, error: fetchError } = await supabase
      .from("mindshare_users")
      .select("mindshare_score")
      .eq("user_id", userId)
      .single()

    if (fetchError) throw fetchError

    const newScore = (user.mindshare_score || 0) + pointsEarned

    const { data, error } = await supabase
      .from("mindshare_users")
      .update({ mindshare_score: newScore, updated_at: new Date() })
      .eq("user_id", userId)
      .select()
      .single()

    if (error) throw error

    await supabase.from("mindshare_activities").insert([
      {
        mindshare_user_id: data.id,
        activity_type: "score_update",
        points_earned: pointsEarned,
        activity_description: `Score updated by ${pointsEarned} points`,
      },
    ])

    return { data, error: null }
  } catch (error: any) {
    return { data: null, error: error.message }
  }
}
