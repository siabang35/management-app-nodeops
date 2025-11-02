import { ApiProperty } from "@nestjs/swagger"

export class CreateTaskDto {
  @ApiProperty({
    description: "Task title",
    example: "Implement user authentication"
  })
  title: string

  @ApiProperty({
    description: "Task description",
    example: "Add JWT-based authentication system",
    required: false
  })
  description?: string

  @ApiProperty({
    description: "Task status",
    enum: ["pending", "in-progress", "review", "completed"],
    example: "pending"
  })
  status: "pending" | "in-progress" | "review" | "completed"

  @ApiProperty({
    description: "Task priority",
    enum: ["low", "medium", "high"],
    example: "high"
  })
  priority: "low" | "medium" | "high"

  @ApiProperty({
    description: "Assignee user ID",
    example: "user-123"
  })
  assignee: string

  @ApiProperty({
    description: "Task due date",
    example: "2025-12-31T23:59:59.000Z",
    required: false
  })
  dueDate?: Date

  @ApiProperty({
    description: "Project ID",
    example: "project-456",
    required: false
  })
  projectId?: string
}
