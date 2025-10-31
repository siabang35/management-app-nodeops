export class CreateTaskDto {
  title: string
  description?: string
  status: "pending" | "in-progress" | "review" | "completed"
  priority: "low" | "medium" | "high"
  assignee: string
  dueDate?: Date
  projectId?: string
}
