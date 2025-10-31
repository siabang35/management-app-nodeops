"use server"

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { serverApiClient } from "@/lib/server-api"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

export async function getTasks(projectId: string) {
  try {
    if (API_BASE_URL) {
      return await serverApiClient.get(`/tasks/project/${projectId}`)
    }
  } catch (error) {
    console.warn("[getTasks] Backend API failed, falling back to Supabase")
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
      .from("tasks")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false })

    if (error) throw error
    return { data, error: null }
  } catch (error: any) {
    return { data: null, error: error.message }
  }
}

export async function createTask(task: any) {
  try {
    if (API_BASE_URL) {
      return await serverApiClient.post("/tasks", task)
    }
  } catch (error) {
    console.warn("[createTask] Backend API failed, falling back to Supabase")
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
    const { data, error } = await supabase.from("tasks").insert([task]).select().single()

    if (error) throw error
    return { data, error: null }
  } catch (error: any) {
    return { data: null, error: error.message }
  }
}

export async function updateTask(taskId: string, updates: any) {
  try {
    if (API_BASE_URL) {
      return await serverApiClient.patch(`/tasks/${taskId}`, updates)
    }
  } catch (error) {
    console.warn("[updateTask] Backend API failed, falling back to Supabase")
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
    const { data, error } = await supabase.from("tasks").update(updates).eq("id", taskId).select().single()

    if (error) throw error
    return { data, error: null }
  } catch (error: any) {
    return { data: null, error: error.message }
  }
}

export async function deleteTask(taskId: string) {
  try {
    if (API_BASE_URL) {
      return await serverApiClient.delete(`/tasks/${taskId}`)
    }
  } catch (error) {
    console.warn("[deleteTask] Backend API failed, falling back to Supabase")
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
    const { error } = await supabase.from("tasks").delete().eq("id", taskId)

    if (error) throw error
    return { error: null }
  } catch (error: any) {
    return { error: error.message }
  }
}
