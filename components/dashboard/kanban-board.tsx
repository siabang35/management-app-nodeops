"use client"

import type React from "react"

import { useState } from "react"
import { TaskCard } from "./task-card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

interface KanbanBoardProps {
  tasks: any[]
  onTaskMove?: (taskId: string, newStatus: string) => void
  onTaskEdit?: (task: any) => void
  onTaskDelete?: (taskId: string) => void
  onAddTask?: (status: string) => void
}

const STATUSES = ["todo", "in-progress", "review", "done"]
const STATUS_LABELS = {
  todo: "To Do",
  "in-progress": "In Progress",
  review: "Review",
  done: "Done",
}

export function KanbanBoard({ tasks, onTaskMove, onTaskEdit, onTaskDelete, onAddTask }: KanbanBoardProps) {
  const [draggedTask, setDraggedTask] = useState<any>(null)

  const handleDragStart = (task: any) => {
    setDraggedTask(task)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (status: string) => {
    if (draggedTask && draggedTask.status !== status) {
      onTaskMove?.(draggedTask.id, status)
      setDraggedTask(null)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {STATUSES.map((status) => (
        <div key={status} onDragOver={handleDragOver} onDrop={() => handleDrop(status)} className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">{STATUS_LABELS[status as keyof typeof STATUS_LABELS]}</h3>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
              {tasks.filter((t) => t.status === status).length}
            </span>
          </div>

          <div className="space-y-3 min-h-96 bg-muted/30 rounded-lg p-3">
            {tasks
              .filter((t) => t.status === status)
              .map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={() => handleDragStart(task)}
                  className="cursor-grab active:cursor-grabbing"
                >
                  <TaskCard task={task} onEdit={onTaskEdit} onDelete={onTaskDelete} />
                </div>
              ))}

            <Button variant="outline" size="sm" onClick={() => onAddTask?.(status)} className="w-full gap-2 mt-2">
              <Plus className="w-4 h-4" />
              Add Task
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
