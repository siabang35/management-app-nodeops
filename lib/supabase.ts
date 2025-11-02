// ============================================================
// 🔹 Supabase Universal Client Setup (Server + Client Safe)
// ============================================================

import { createClient } from "@supabase/supabase-js"
import { createServerClient } from "@supabase/ssr"

// Hanya impor `cookies` jika environment mendukung (Server Component)
let cookiesFn: any = null
try {
  const { cookies } = require("next/headers")
  cookiesFn = cookies
} catch {
  // Tidak masalah — berarti dijalankan di client
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://oizxsktwayfiqaszupev.supabase.co"
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// ============================================================
// 🔹 Client-side Supabase
// ============================================================
export const supabase = createClient(supabaseUrl, supabaseKey)

// ============================================================
// 🔹 Server-side Supabase (Hanya dipakai di server actions / API routes)
// ============================================================
export async function createAuthenticatedClient() {
  if (!cookiesFn) {
    throw new Error("createAuthenticatedClient() hanya dapat dipanggil di environment server.")
  }

  const cookieStore = cookiesFn()

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value, options }) =>
          cookieStore.set(name, value, options)
        )
      },
    },
  })
}

// ============================================================
// 🔹 Types for database
// ============================================================
export interface Task {
  id: string
  title: string
  description: string
  status: "todo" | "in-progress" | "review" | "done"
  priority: "low" | "medium" | "high"
  assignee_id: string
  project_id: string
  due_date: string | null
  created_at: string
  updated_at: string
  tags: string[]
  attachments: string[]
}

export interface Project {
  id: string
  name: string
  description: string
  icon: string
  color: string
  owner_id: string
  created_at: string
  updated_at: string
}

export interface TeamMember {
  id: string
  name: string
  email: string
  role: "moderator" | "ambassador"
  avatar_url: string
  status: "online" | "away" | "offline"
  created_at: string
}

export interface Report {
  id: string
  title: string
  type: "revenue" | "task" | "team"
  data: Record<string, any>
  created_at: string
  created_by: string
}

// ============================================================
// 🔹 Extended types for ambassador and moderator functionality
// ============================================================
export interface Ambassador {
  id: string
  user_id: string
  wallet_address: string
  email: string
  twitter_handle?: string
  telegram_handle?: string
  discord_handle?: string
  points: number
  mindshare_score: number
  tasks_completed: number
  created_at: string
  updated_at: string
}

export interface Moderator {
  id: string
  user_id: string
  permissions: string[]
  managed_ambassadors: string[]
  created_at: string
  updated_at: string
}

export interface MindshareEntry {
  id: string
  ambassador_id: string
  score: number
  activity_type: string
  metadata: Record<string, any>
  created_at: string
}

export interface TaskPoints {
  id: string
  ambassador_id: string
  task_id: string
  points_earned: number
  completed_at: string
}

// ============================================================
// 🔹 Real-time subscription helpers
// ============================================================
export const subscribeToAmbassadorUpdates = (
  ambassadorId: string,
  callback: (payload: any) => void
) => {
  return supabase
    .channel(`ambassador_${ambassadorId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "ambassadors",
        filter: `id=eq.${ambassadorId}`,
      },
      callback
    )
    .subscribe()
}

export const subscribeToMindshareUpdates = (
  callback: (payload: any) => void
) => {
  return supabase
    .channel("mindshare_updates")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "mindshare_entries",
      },
      callback
    )
    .subscribe()
}

// ============================================================
// 🔹 Secure API functions with error handling
// ============================================================
export const getAmbassadorData = async (userId: string): Promise<Ambassador | null> => {
  try {
    const { data, error } = await supabase
      .from("ambassadors")
      .select("*")
      .eq("user_id", userId)
      .single()

    if (error) {
      console.error("Error fetching ambassador data:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Unexpected error in getAmbassadorData:", error)
    return null
  }
}

export const getTopAmbassadors = async (limit: number = 25): Promise<Ambassador[]> => {
  try {
    const { data, error } = await supabase
      .from("ambassadors")
      .select("*")
      .order("mindshare_score", { ascending: false })
      .limit(limit)

    if (error) {
      console.error("Error fetching top ambassadors:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Unexpected error in getTopAmbassadors:", error)
    return []
  }
}

export const updateAmbassadorPoints = async (
  ambassadorId: string,
  points: number
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("ambassadors")
      .update({ points, updated_at: new Date().toISOString() })
      .eq("id", ambassadorId)

    if (error) {
      console.error("Error updating ambassador points:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Unexpected error in updateAmbassadorPoints:", error)
    return false
  }
}
