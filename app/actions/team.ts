"use server"

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { serverApiClient } from "@/lib/server-api"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

export async function getTeamMembers(projectId: string) {
  try {
    if (API_BASE_URL) {
      return await serverApiClient.get(`/teams/project/${projectId}`)
    }
  } catch (error) {
    console.warn("[getTeamMembers] Backend API failed, falling back to Supabase")
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
      .from("team_members")
      .select("*")
      .eq("project_id", projectId)
      .order("joined_at", { ascending: false })

    if (error) throw error
    return { data, error: null }
  } catch (error: any) {
    return { data: null, error: error.message }
  }
}

export async function addTeamMember(member: any) {
  try {
    if (API_BASE_URL) {
      return await serverApiClient.post("/teams", member)
    }
  } catch (error) {
    console.warn("[addTeamMember] Backend API failed, falling back to Supabase")
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
    const { data, error } = await supabase.from("team_members").insert([member]).select().single()

    if (error) throw error
    return { data, error: null }
  } catch (error: any) {
    return { data: null, error: error.message }
  }
}

export async function updateTeamMember(memberId: string, updates: any) {
  try {
    if (API_BASE_URL) {
      return await serverApiClient.patch(`/teams/${memberId}`, updates)
    }
  } catch (error) {
    console.warn("[updateTeamMember] Backend API failed, falling back to Supabase")
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
    const { data, error } = await supabase.from("team_members").update(updates).eq("id", memberId).select().single()

    if (error) throw error
    return { data, error: null }
  } catch (error: any) {
    return { data: null, error: error.message }
  }
}

export async function deleteTeamMember(memberId: string) {
  try {
    if (API_BASE_URL) {
      return await serverApiClient.delete(`/teams/${memberId}`)
    }
  } catch (error) {
    console.warn("[deleteTeamMember] Backend API failed, falling back to Supabase")
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
    const { error } = await supabase.from("team_members").delete().eq("id", memberId)

    if (error) throw error
    return { error: null }
  } catch (error: any) {
    return { error: error.message }
  }
}

export async function getTeamStats(projectId: string) {
  try {
    if (API_BASE_URL) {
      return await serverApiClient.get(`/teams/stats/${projectId}`)
    }
  } catch (error) {
    console.warn("[getTeamStats] Backend API failed, falling back to Supabase")
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
    const { data, error } = await supabase.from("team_members").select("role").eq("project_id", projectId)

    if (error) throw error

    const total = data?.length || 0
    const moderators = data?.filter((m: any) => m.role === "moderator").length || 0
    const ambassadors = data?.filter((m: any) => m.role === "ambassador").length || 0

    return {
      data: {
        total,
        moderators,
        ambassadors,
        members: total - moderators - ambassadors,
      },
      error: null,
    }
  } catch (error: any) {
    return { data: null, error: error.message }
  }
}
