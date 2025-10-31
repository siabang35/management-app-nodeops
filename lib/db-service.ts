import { supabase, type Task, type Project, type TeamMember, type Report } from "./supabase"

// Task operations
export const taskService = {
  async getTasks(projectId: string) {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data as Task[]
  },

  async getTaskById(taskId: string) {
    const { data, error } = await supabase.from("tasks").select("*").eq("id", taskId).single()

    if (error) throw error
    return data as Task
  },

  async createTask(task: Omit<Task, "id" | "created_at" | "updated_at">) {
    const { data, error } = await supabase
      .from("tasks")
      .insert([
        {
          ...task,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (error) throw error
    return data as Task
  },

  async updateTask(taskId: string, updates: Partial<Task>) {
    const { data, error } = await supabase
      .from("tasks")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", taskId)
      .select()
      .single()

    if (error) throw error
    return data as Task
  },

  async deleteTask(taskId: string) {
    const { error } = await supabase.from("tasks").delete().eq("id", taskId)

    if (error) throw error
  },

  async getTasksByStatus(projectId: string, status: string) {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("project_id", projectId)
      .eq("status", status)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data as Task[]
  },

  async searchTasks(projectId: string, query: string) {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("project_id", projectId)
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)

    if (error) throw error
    return data as Task[]
  },
}

// Project operations
export const projectService = {
  async getProjects(userId: string) {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("owner_id", userId)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data as Project[]
  },

  async createProject(project: Omit<Project, "id" | "created_at" | "updated_at">) {
    const { data, error } = await supabase
      .from("projects")
      .insert([
        {
          ...project,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (error) throw error
    return data as Project
  },

  async updateProject(projectId: string, updates: Partial<Project>) {
    const { data, error } = await supabase
      .from("projects")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", projectId)
      .select()
      .single()

    if (error) throw error
    return data as Project
  },
}

// Team operations
export const teamService = {
  async getTeamMembers(projectId: string) {
    const { data, error } = await supabase
      .from("team_members")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data as TeamMember[]
  },

  async addTeamMember(member: Omit<TeamMember, "id" | "created_at"> & { project_id: string }) {
    const { data, error } = await supabase
      .from("team_members")
      .insert([
        {
          ...member,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (error) throw error
    return data as TeamMember
  },

  async updateTeamMember(memberId: string, updates: Partial<TeamMember>) {
    const { data, error } = await supabase.from("team_members").update(updates).eq("id", memberId).select().single()

    if (error) throw error
    return data as TeamMember
  },

  async removeTeamMember(memberId: string) {
    const { error } = await supabase.from("team_members").delete().eq("id", memberId)

    if (error) throw error
  },
}

// Report operations
export const reportService = {
  async getReports(projectId: string) {
    const { data, error } = await supabase
      .from("reports")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data as Report[]
  },

  async createReport(report: Omit<Report, "id" | "created_at"> & { project_id: string }) {
    const { data, error } = await supabase
      .from("reports")
      .insert([
        {
          ...report,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (error) throw error
    return data as Report
  },
}
