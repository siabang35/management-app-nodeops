import { Injectable } from "@nestjs/common"
import type { SupabaseService } from "../supabase/supabase.service"

@Injectable()
export class ReportsService {
  constructor(private supabaseService: SupabaseService) {}

  async generateRevenueReport(startDate: Date, endDate: Date) {
    const supabase = this.supabaseService.getClient()
    const { data, error } = await supabase
      .from("revenue")
      .select("*")
      .gte("date", startDate.toISOString())
      .lte("date", endDate.toISOString())

    if (error) throw error

    const total = data.reduce((sum, item) => sum + item.amount, 0)
    const average = total / data.length

    return {
      period: { startDate, endDate },
      total,
      average,
      count: data.length,
      data,
    }
  }

  async generateTaskReport(startDate: Date, endDate: Date) {
    const supabase = this.supabaseService.getClient()
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .gte("created_at", startDate.toISOString())
      .lte("created_at", endDate.toISOString())

    if (error) throw error

    const stats = {
      total: data.length,
      completed: data.filter((t) => t.status === "completed").length,
      inProgress: data.filter((t) => t.status === "in-progress").length,
      pending: data.filter((t) => t.status === "pending").length,
      completionRate: (data.filter((t) => t.status === "completed").length / data.length) * 100,
    }

    return {
      period: { startDate, endDate },
      ...stats,
      data,
    }
  }

  async generateTeamReport(startDate: Date, endDate: Date) {
    const supabase = this.supabaseService.getClient()
    const { data: members, error: membersError } = await supabase.from("team_members").select("*")

    if (membersError) throw membersError

    const { data: tasks, error: tasksError } = await supabase
      .from("tasks")
      .select("*")
      .gte("created_at", startDate.toISOString())
      .lte("created_at", endDate.toISOString())

    if (tasksError) throw tasksError

    const memberStats = members.map((member) => ({
      ...member,
      tasksAssigned: tasks.filter((t) => t.assignee === member.id).length,
      tasksCompleted: tasks.filter((t) => t.assignee === member.id && t.status === "completed").length,
    }))

    return {
      period: { startDate, endDate },
      totalMembers: members.length,
      memberStats,
    }
  }

  async getMetrics() {
    const supabase = this.supabaseService.getClient()

    const { data: tasks } = await supabase.from("tasks").select("*")
    const { data: members } = await supabase.from("team_members").select("*")
    const { data: revenue } = await supabase.from("revenue").select("*")

    const totalRevenue = revenue?.reduce((sum, item) => sum + item.amount, 0) || 0

    return {
      totalTasks: tasks?.length || 0,
      completedTasks: tasks?.filter((t) => t.status === "completed").length || 0,
      totalMembers: members?.length || 0,
      activeMembers: members?.filter((m) => m.status === "active").length || 0,
      totalRevenue,
      averageRevenue: totalRevenue / (revenue?.length || 1),
    }
  }
}
