export class CreateTeamMemberDto {
  name: string
  email: string
  role: "moderator" | "ambassador"
  status: "active" | "inactive" | "away"
  avatar?: string
  joinDate?: Date
}
