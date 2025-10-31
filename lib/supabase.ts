import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://oizxsktwayfiqaszupev.supabase.co"
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

export const supabase = createClient(supabaseUrl, supabaseKey)

// Types for database
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
  role: "admin" | "moderator" | "ambassador" | "member"
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
