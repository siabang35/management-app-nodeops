"use client"

import { GripVertical, MoreVertical, Calendar, Tag, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { formatDate } from "@/lib/utils"

interface TaskCardProps {
  task: any
  onEdit?: (task: any) => void
  onDelete?: (taskId: string) => void
  draggable?: boolean
}

export function TaskCard({ task, onEdit, onDelete, draggable = true }: TaskCardProps) {
  const priorityColors = {
    low: "bg-green-500/20 text-green-400",
    medium: "bg-yellow-500/20 text-yellow-400",
    high: "bg-red-500/20 text-red-400",
  }

  const statusColors = {
    todo: "bg-gray-500/20 text-gray-400",
    "in-progress": "bg-blue-500/20 text-blue-400",
    review: "bg-purple-500/20 text-purple-400",
    done: "bg-green-500/20 text-green-400",
  }

  return (
    <Card draggable={draggable} className="p-4 hover:shadow-lg transition-all cursor-move group">
      <div className="flex gap-3">
        {draggable && <GripVertical className="w-4 h-4 text-muted-foreground mt-1 flex-shrink-0" />}

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h4 className="font-semibold text-sm leading-tight text-foreground line-clamp-2">{task.title}</h4>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100 flex-shrink-0"
              onClick={() => onDelete?.(task.id)}
            >
              <MoreVertical className="w-3 h-3" />
            </Button>
          </div>

          {task.description && <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{task.description}</p>}

          <div className="flex flex-wrap gap-2 mb-3">
            <span
              className={`px-2 py-1 rounded text-xs font-medium ${priorityColors[task.priority as keyof typeof priorityColors]}`}
            >
              {task.priority}
            </span>
            <span
              className={`px-2 py-1 rounded text-xs font-medium ${statusColors[task.status as keyof typeof statusColors]}`}
            >
              {task.status}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {task.due_date && (
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatDate(task.due_date)}
              </div>
            )}
            {task.tags?.length > 0 && (
              <div className="flex items-center gap-1">
                <Tag className="w-3 h-3" />
                {task.tags.length}
              </div>
            )}
            {task.assignee_id && (
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                Assigned
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}
