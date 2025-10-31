"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TaskBoard } from "@/components/dashboard/task-board"
import { TaskFilters } from "@/components/dashboard/task-filters"
import { TaskModal } from "@/components/modals/task-modal"
import { DatabaseView } from "@/components/views/database-view"

export function TasksView() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [viewType, setViewType] = useState<"kanban" | "table" | "calendar" | "gallery">("kanban")
  const [filters, setFilters] = useState({})
  const [sortBy, setSortBy] = useState("created_at")

  const mockTasks = [
    {
      id: "1",
      title: "Update smart contract documentation",
      description: "Complete the documentation for the new smart contract features",
      status: "in-progress",
      priority: "high",
      assignee_id: "user-1",
      due_date: "2024-11-15",
      tags: ["documentation", "smart-contract"],
      created_at: new Date().toISOString(),
    },
    {
      id: "2",
      title: "Review Q1 revenue reports",
      description: "Analyze and review the quarterly revenue reports",
      status: "done",
      priority: "medium",
      assignee_id: "user-2",
      due_date: "2024-11-10",
      tags: ["revenue", "reports"],
      created_at: new Date().toISOString(),
    },
    {
      id: "3",
      title: "Onboard new ambassador team",
      description: "Complete onboarding process for new ambassadors",
      status: "in-progress",
      priority: "high",
      assignee_id: "user-3",
      due_date: "2024-11-20",
      tags: ["team", "onboarding"],
      created_at: new Date().toISOString(),
    },
  ]

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tasks Management</h1>
          <p className="mt-2 text-muted-foreground">Manage all your project tasks and workflows</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          New Task
        </Button>
      </div>

      <TaskFilters onFilterChange={setFilters} onSortChange={setSortBy} />

      {viewType === "kanban" && <TaskBoard expanded />}
      {viewType === "table" && <DatabaseView title="Tasks" items={mockTasks} />}

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={(task) => {
          console.log("New task:", task)
          setIsModalOpen(false)
        }}
      />
    </div>
  )
}
