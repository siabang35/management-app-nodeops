"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MoreVertical } from "lucide-react"
import { getPriorityColor, getStatusColor, formatDate } from "@/lib/utils"

interface GalleryViewProps {
  tasks: any[]
  onTaskEdit?: (task: any) => void
  onTaskDelete?: (taskId: string) => void
}

export function GalleryView({ tasks, onTaskEdit, onTaskDelete }: GalleryViewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {tasks.map((task) => (
        <Card key={task.id} className="p-4 hover:shadow-lg transition-shadow group">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="font-semibold text-foreground line-clamp-2">{task.title}</h3>
              <p className="text-xs text-muted-foreground mt-1">{task.assignee_id || "Unassigned"}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100"
              onClick={() => onTaskDelete?.(task.id)}
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>

          <div className="w-full h-32 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg mb-3 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{task.title.charAt(0).toUpperCase()}</div>
              <p className="text-xs text-muted-foreground mt-1">Task</p>
            </div>
          </div>

          {task.description && <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{task.description}</p>}

          <div className="flex gap-2 mb-3 flex-wrap">
            <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(task.priority)}`}>
              {task.priority}
            </span>
            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(task.status)}`}>
              {task.status}
            </span>
          </div>

          {task.due_date && (
            <div className="text-xs text-muted-foreground border-t border-border pt-3">
              Due: {formatDate(task.due_date)}
            </div>
          )}
        </Card>
      ))}
    </div>
  )
}
