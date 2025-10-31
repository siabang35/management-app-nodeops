import { createBrowserClient } from "@supabase/ssr"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)

// Backend API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"

// API Client for NestJS Backend
export const apiClient = {
  async request<T>(endpoint: string, options: RequestInit & { method?: string } = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`
    const token = localStorage.getItem("auth_token")

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    }

    if (token) {
      headers['authorization'] = `Bearer ${token}`
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`)
      }

      return await response.json()
    } catch (error: any) {
      console.error(`[API] Error on ${endpoint}:`, error)
      throw error
    }
  },

  get<T>(endpoint: string, options?: RequestInit) {
    return this.request<T>(endpoint, { ...options, method: "GET" })
  },

  post<T>(endpoint: string, body?: any, options?: RequestInit) {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: JSON.stringify(body),
    })
  },

  patch<T>(endpoint: string, body?: any, options?: RequestInit) {
    return this.request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: JSON.stringify(body),
    })
  },

  delete<T>(endpoint: string, options?: RequestInit) {
    return this.request<T>(endpoint, { ...options, method: "DELETE" })
  },
}

// Auth Service
export const authService = {
  async signUp(email: string, password: string, fullName: string) {
    return apiClient.post("/auth/signup", { email, password, fullName })
  },

  async signIn(email: string, password: string) {
    const response: any = await apiClient.post("/auth/signin", { email, password })
    if (response.token) {
      localStorage.setItem("auth_token", response.token)
    }
    return response
  },

  async signOut() {
    localStorage.removeItem("auth_token")
    return { success: true }
  },

  async getProfile(userId: string) {
    return apiClient.get(`/auth/profile/${userId}`)
  },

  async updateProfile(updates: any) {
    return apiClient.patch(`/auth/profile`, updates)
  },
}

// Tasks Service
export const tasksService = {
  async getTasks(projectId: string) {
    return apiClient.get(`/tasks/project/${projectId}`)
  },

  async getTaskById(taskId: string) {
    return apiClient.get(`/tasks/${taskId}`)
  },

  async createTask(task: any) {
    return apiClient.post("/tasks", task)
  },

  async updateTask(taskId: string, updates: any) {
    return apiClient.patch(`/tasks/${taskId}`, updates)
  },

  async deleteTask(taskId: string) {
    return apiClient.delete(`/tasks/${taskId}`)
  },

  async getTaskStats(projectId: string) {
    return apiClient.get(`/tasks/stats/${projectId}`)
  },
}

// Team Service
export const teamService = {
  async getTeamMembers(projectId: string) {
    return apiClient.get(`/teams/project/${projectId}`)
  },

  async getTeamMemberById(memberId: string) {
    return apiClient.get(`/teams/member/${memberId}`)
  },

  async addTeamMember(member: any) {
    return apiClient.post("/teams", member)
  },

  async updateTeamMember(memberId: string, updates: any) {
    return apiClient.patch(`/teams/${memberId}`, updates)
  },

  async deleteTeamMember(memberId: string) {
    return apiClient.delete(`/teams/${memberId}`)
  },

  async getTeamStats(projectId: string) {
    return apiClient.get(`/teams/stats/${projectId}`)
  },
}

// Reports Service
export const reportsService = {
  async getReports(projectId: string) {
    return apiClient.get(`/reports/project/${projectId}`)
  },

  async getReportById(reportId: string) {
    return apiClient.get(`/reports/${reportId}`)
  },

  async createReport(report: any) {
    return apiClient.post("/reports", report)
  },

  async updateReport(reportId: string, updates: any) {
    return apiClient.patch(`/reports/${reportId}`, updates)
  },

  async deleteReport(reportId: string) {
    return apiClient.delete(`/reports/${reportId}`)
  },

  async getRevenueReport(projectId: string, startDate?: string, endDate?: string) {
    const params = new URLSearchParams()
    if (startDate) params.append("startDate", startDate)
    if (endDate) params.append("endDate", endDate)
    return apiClient.get(`/reports/revenue/${projectId}?${params.toString()}`)
  },
}

// Mindshare Service
export const mindshareService = {
  async getLeaderboard(limit = 25) {
    return apiClient.get(`/mindshare/leaderboard?limit=${limit}`)
  },

  async getUserProfile(userId: string) {
    return apiClient.get(`/mindshare/profile/${userId}`)
  },

  async createMindshareUser(userId: string, walletAddress: string) {
    return apiClient.post("/mindshare/profile", { userId, walletAddress })
  },

  async updateUserProfile(userId: string, updates: any) {
    return apiClient.patch(`/mindshare/profile/${userId}`, updates)
  },

  async updateMindshareScore(userId: string, points: number) {
    return apiClient.patch(`/mindshare/score/${userId}`, { points })
  },
}

// User Service for Supabase
export const userService = {
  async getProfile(userId: string) {
    const { data, error } = await supabase.from("users").select("*").eq("id", userId).single()
    if (error) throw error
    return data
  },

  async updateProfile(userId: string, updates: any) {
    const { data, error } = await supabase.from("users").update(updates).eq("id", userId).select().single()
    if (error) throw error
    return data
  },
}
