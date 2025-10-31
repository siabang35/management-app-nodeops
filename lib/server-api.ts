import { cookies } from "next/headers"

const BACKEND_INTERNAL_URL = process.env.BACKEND_INTERNAL_URL || "http://localhost:3001/api"

export const serverApiClient = {
  async request<T>(endpoint: string, options: RequestInit & { method?: string } = {}): Promise<T> {
    const url = `${BACKEND_INTERNAL_URL}${endpoint}`
    const cookieStore = await cookies()
    const token = cookieStore.get("auth_token")?.value

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    }

    if (token) {
      headers["Authorization"] = `Bearer ${token}`
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
      console.error(`[Server API] Error on ${endpoint}:`, error)
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
