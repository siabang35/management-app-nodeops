import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"

export class CreateTeamMemberDto {
  @ApiProperty({
    description: "Team member name",
    example: "John Doe"
  })
  name: string

  @ApiProperty({
    description: "Team member email",
    example: "john.doe@example.com"
  })
  email: string

  @ApiProperty({
    description: "Team member role",
    enum: ["moderator", "ambassador"],
    example: "moderator"
  })
  role: "moderator" | "ambassador"

  @ApiProperty({
    description: "Team member status",
    enum: ["active", "inactive", "away"],
    example: "active"
  })
  status: "active" | "inactive" | "away"

  @ApiPropertyOptional({
    description: "Team member avatar URL",
    example: "https://example.com/avatar.jpg"
  })
  avatar?: string

  @ApiPropertyOptional({
    description: "Team member join date",
    example: "2025-01-01T00:00:00.000Z"
  })
  joinDate?: Date
}
