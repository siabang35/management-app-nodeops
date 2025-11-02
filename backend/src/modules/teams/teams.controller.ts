import { Controller, Get, Post, Param, Put, Delete, Query } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from "@nestjs/swagger"
import { TeamsService } from "./teams.service"
import { CreateTeamMemberDto } from "./dto/create-team-member.dto"

@ApiTags("teams")
@Controller("teams")
export class TeamsController {
  constructor(private teamsService: TeamsService) {}

  @Post()
  @ApiOperation({ summary: "Create a new team member" })
  @ApiResponse({ status: 201, description: "Team member created successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  createMember(createTeamMemberDto: CreateTeamMemberDto) {
    return this.teamsService.createMember(createTeamMemberDto)
  }

  @Get()
  @ApiOperation({ summary: "Get all team members with optional role filter" })
  @ApiQuery({ name: "role", required: false, description: "Filter by team member role" })
  @ApiResponse({ status: 200, description: "Team members retrieved successfully" })
  findAll(@Query("role") role?: string) {
    return this.teamsService.findAllMembers(role)
  }

  @Get("stats")
  @ApiOperation({ summary: "Get team statistics" })
  @ApiResponse({ status: 200, description: "Team statistics retrieved" })
  getStats() {
    return this.teamsService.getTeamStats()
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a team member by ID" })
  @ApiParam({ name: "id", description: "Team member ID" })
  @ApiResponse({ status: 200, description: "Team member retrieved successfully" })
  @ApiResponse({ status: 404, description: "Team member not found" })
  findOne(@Param("id") id: string) {
    return this.teamsService.findMemberById(id)
  }

  @Put(":id")
  @ApiOperation({ summary: "Update a team member" })
  @ApiParam({ name: "id", description: "Team member ID" })
  @ApiResponse({ status: 200, description: "Team member updated successfully" })
  @ApiResponse({ status: 404, description: "Team member not found" })
  update(@Param("id") id: string, updateData: Partial<CreateTeamMemberDto>) {
    return this.teamsService.updateMember(id, updateData)
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a team member" })
  @ApiParam({ name: "id", description: "Team member ID" })
  @ApiResponse({ status: 200, description: "Team member deleted successfully" })
  @ApiResponse({ status: 404, description: "Team member not found" })
  remove(@Param("id") id: string) {
    return this.teamsService.removeMember(id)
  }
}
