"use client"

import { useState } from "react"
import { ChevronUp, ChevronDown, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatDate, getPriorityColor, getStatusColor } from "@/lib/utils"

interface TableViewProps {
  tasks: any[]
  onTaskEdit?: (task: any) => void
  onTaskDelete?: (taskId: string) => void
}

type SortField = "title" | "priority" | "status" | "due_date" | "created_at"
type SortOrder = "asc" | "desc"

export function TableView({ tasks, onTaskEdit, onTaskDelete }: TableViewProps) {
  const [sortField, setSortField] = useState<SortField>("created_at")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("asc")
    }
  }

  const sortedTasks = [...tasks].sort((a, b) => {
    let aVal = a[sortField]
    let bVal = b[sortField]

    if (typeof aVal === "string") {
      aVal = aVal.toLowerCase()
      bVal = (bVal as string).toLowerCase()
    }

    if (aVal < bVal) return sortOrder === "asc" ? -1 : 1
    if (aVal > bVal) return sortOrder === "asc" ? 1 : -1
    return 0
  })

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <div className="w-4 h-4" />
    return sortOrder === "asc" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="text-left p-3 font-semibold">
              <button onClick={() => handleSort("title")} className="flex items-center gap-2 hover:text-primary">
                Title
                <SortIcon field="title" />
              </button>
            </th>
            <th className="text-left p-3 font-semibold">
              <button onClick={() => handleSort("status")} className="flex items-center gap-2 hover:text-primary">
                Status
                <SortIcon field="status" />
              </button>
            </th>
            <th className="text-left p-3 font-semibold">
              <button onClick={() => handleSort("priority")} className="flex items-center gap-2 hover:text-primary">
                Priority
                <SortIcon field="priority" />
              </button>
            </th>
            <th className="text-left p-3 font-semibold">Assignee</th>
            <th className="text-left p-3 font-semibold">
              <button onClick={() => handleSort("due_date")} className="flex items-center gap-2 hover:text-primary">
                Due Date
                <SortIcon field="due_date" />
              </button>
            </th>
            <th className="text-left p-3 font-semibold">Tags</th>
            <th className="text-left p-3 font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedTasks.map((task) => (
            <tr key={task.id} className="border-b border-border hover:bg-muted/30 transition-colors">
              <td className="p-3">
                <div className="font-medium text-foreground line-clamp-1">{task.title}</div>
                {task.description && (
                  <div className="text-xs text-muted-foreground line-clamp-1">{task.description}</div>
                )}
              </td>
              <td className="p-3">
                <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(task.status)}`}>
                  {task.status}
                </span>
              </td>
              <td className="p-3">
                <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
              </td>
              <td className="p-3 text-muted-foreground">{task.assignee_id || "-"}</td>
              <td className="p-3 text-muted-foreground">{task.due_date ? formatDate(task.due_date) : "-"}</td>
              <td className="p-3">
                {task.tags?.length > 0 ? (
                  <div className="flex gap-1 flex-wrap">
                    {task.tags.slice(0, 2).map((tag: string) => (
                      <span key={tag} className="px-2 py-1 bg-primary/10 text-primary rounded text-xs">
                        {tag}
                      </span>
                    ))}
                    {task.tags.length > 2 && (
                      <span className="px-2 py-1 text-muted-foreground text-xs">+{task.tags.length - 2}</span>
                    )}
                  </div>
                ) : (
                  "-"
                )}
              </td>
              <td className="p-3">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onTaskDelete?.(task.id)}>
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
