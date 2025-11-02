import { ApiPropertyOptional } from "@nestjs/swagger"

export class UpdateTaskDto {
  @ApiPropertyOptional({
    description: "Task title",
    example: "Implement user authentication"
  })
  title?: string

  @ApiPropertyOptional({
    description: "Task description",
    example: "Add JWT-based authentication system"
  })
  description?: string

  @ApiPropertyOptional({
    description: "Task status",
    enum: ["pending", "in-progress", "review", "completed"],
    example: "in-progress"
  })
  status?: "pending" | "in-progress" | "review" | "completed"

  @ApiPropertyOptional({
    description: "Task priority",
    enum: ["low", "medium", "high"],
    example: "high"
  })
  priority?: "low" | "medium" | "high"

  @ApiPropertyOptional({
    description: "Assignee user ID",
    example: "user-123"
  })
  assignee?: string

  @ApiPropertyOptional({
    description: "Task due date",
    example: "2025-12-31T23:59:59.000Z"
  })
  dueDate?: Date
}
