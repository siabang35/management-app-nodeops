import { Injectable } from "@nestjs/common"
import type { SupabaseService } from "../supabase/supabase.service"
import type { CreateTeamMemberDto } from "./dto/create-team-member.dto"

@Injectable()
export class TeamsService {
  constructor(private supabaseService: SupabaseService) {}

  async createMember(createTeamMemberDto: CreateTeamMemberDto) {
    const supabase = this.supabaseService.getClient()
    const { data, error } = await supabase.from("team_members").insert([createTeamMemberDto]).select()

    if (error) throw error
    return data[0]
  }

  async findAllMembers(role?: string) {
    const supabase = this.supabaseService.getClient()
    let query = supabase.from("team_members").select("*")

    if (role) query = query.eq("role", role)

    const { data, error } = await query

    if (error) throw error
    return data
  }

  async findMemberById(id: string) {
    const supabase = this.supabaseService.getClient()
    const { data, error } = await supabase.from("team_members").select("*").eq("id", id).single()

    if (error) throw error
    return data
  }

  async updateMember(id: string, updateData: Partial<CreateTeamMemberDto>) {
    const supabase = this.supabaseService.getClient()
    const { data, error } = await supabase.from("team_members").update(updateData).eq("id", id).select()

    if (error) throw error
    return data[0]
  }

  async removeMember(id: string) {
    const supabase = this.supabaseService.getClient()
    const { error } = await supabase.from("team_members").delete().eq("id", id)

    if (error) throw error
    return { message: "Team member removed successfully" }
  }

  async getTeamStats() {
    const supabase = this.supabaseService.getClient()
    const { data, error } = await supabase.from("team_members").select("role, status")

    if (error) throw error

    const stats = {
      total: data.length,
      moderators: data.filter((m) => m.role === "moderator").length,
      ambassadors: data.filter((m) => m.role === "ambassador").length,
      active: data.filter((m) => m.status === "active").length,
    }

    return stats
  }
}
