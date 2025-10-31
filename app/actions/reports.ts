"use server"

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { serverApiClient } from "@/lib/server-api"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

export async function getRevenueReport(startDate: string, endDate: string) {
  try {
    if (API_BASE_URL) {
      return await serverApiClient.get(`/reports/revenue?startDate=${startDate}&endDate=${endDate}`)
    }
  } catch (error) {
    console.warn("[getRevenueReport] Backend API failed, falling back to Supabase")
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
      .from("reports")
      .select("*")
      .eq("type", "revenue")
      .gte("start_date", startDate)
      .lte("end_date", endDate)

    if (error) throw error
    return { data, error: null }
  } catch (error: any) {
    return { data: null, error: error.message }
  }
}

export async function createReport(report: any) {
  try {
    if (API_BASE_URL) {
      return await serverApiClient.post("/reports", report)
    }
  } catch (error) {
    console.warn("[createReport] Backend API failed, falling back to Supabase")
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
    const { data, error } = await supabase.from("reports").insert([report]).select().single()

    if (error) throw error
    return { data, error: null }
  } catch (error: any) {
    return { data: null, error: error.message }
  }
}

export async function getKeyMetrics() {
  try {
    if (API_BASE_URL) {
      return await serverApiClient.get("/reports/metrics")
    }
  } catch (error) {
    console.warn("[getKeyMetrics] Backend API failed, falling back to Supabase")
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
    const { data: tasks, error: tasksError } = await supabase
      .from("tasks")
      .select("status")
      .in("status", ["done", "in-progress", "todo"])

    if (tasksError) throw tasksError

    const totalTasks = tasks?.length || 0
    const completedTasks = tasks?.filter((t: any) => t.status === "done").length || 0

    const { data: members, error: membersError } = await supabase.from("team_members").select("id")

    if (membersError) throw membersError

    const totalMembers = members?.length || 0

    return {
      data: {
        totalTasks,
        completedTasks,
        totalMembers,
        completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      },
      error: null,
    }
  } catch (error: any) {
    return { data: null, error: error.message }
  }
}
