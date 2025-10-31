import { Controller, Get, Post, Param, Put, Delete } from "@nestjs/common"
import type { TeamsService } from "./teams.service"
import type { CreateTeamMemberDto } from "./dto/create-team-member.dto"

@Controller("teams")
export class TeamsController {
  constructor(private teamsService: TeamsService) {}

  @Post()
  createMember(createTeamMemberDto: CreateTeamMemberDto) {
    return this.teamsService.createMember(createTeamMemberDto)
  }

  @Get()
  findAll(role?: string) {
    return this.teamsService.findAllMembers(role)
  }

  @Get("stats")
  getStats() {
    return this.teamsService.getTeamStats()
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.teamsService.findMemberById(id)
  }

  @Put(":id")
  update(@Param("id") id: string, updateData: Partial<CreateTeamMemberDto>) {
    return this.teamsService.updateMember(id, updateData)
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.teamsService.removeMember(id)
  }
}
