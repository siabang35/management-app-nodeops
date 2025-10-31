import { Injectable } from "@nestjs/common"
import type { SupabaseService } from "../supabase/supabase.service"
import type { CreateTaskDto } from "./dto/create-task.dto"
import type { UpdateTaskDto } from "./dto/update-task.dto"

@Injectable()
export class TasksService {
  constructor(private supabaseService: SupabaseService) {}

  async create(createTaskDto: CreateTaskDto) {
    const supabase = this.supabaseService.getClient()
    const { data, error } = await supabase.from("tasks").insert([createTaskDto]).select()

    if (error) throw error
    return data[0]
  }

  async findAll(filters?: { status?: string; priority?: string; assignee?: string }) {
    const supabase = this.supabaseService.getClient()
    let query = supabase.from("tasks").select("*")

    if (filters?.status) query = query.eq("status", filters.status)
    if (filters?.priority) query = query.eq("priority", filters.priority)
    if (filters?.assignee) query = query.eq("assignee", filters.assignee)

    const { data, error } = await query

    if (error) throw error
    return data
  }

  async findOne(id: string) {
    const supabase = this.supabaseService.getClient()
    const { data, error } = await supabase.from("tasks").select("*").eq("id", id).single()

    if (error) throw error
    return data
  }

  async update(id: string, updateTaskDto: UpdateTaskDto) {
    const supabase = this.supabaseService.getClient()
    const { data, error } = await supabase.from("tasks").update(updateTaskDto).eq("id", id).select()

    if (error) throw error
    return data[0]
  }

  async remove(id: string) {
    const supabase = this.supabaseService.getClient()
    const { error } = await supabase.from("tasks").delete().eq("id", id)

    if (error) throw error
    return { message: "Task deleted successfully" }
  }

  async getTaskStats() {
    const supabase = this.supabaseService.getClient()
    const { data, error } = await supabase.from("tasks").select("status, priority")

    if (error) throw error

    const stats = {
      total: data.length,
      completed: data.filter((t) => t.status === "completed").length,
      inProgress: data.filter((t) => t.status === "in-progress").length,
      pending: data.filter((t) => t.status === "pending").length,
      highPriority: data.filter((t) => t.priority === "high").length,
    }

    return stats
  }
}
