"use client"

import { MoreVertical, Circle, CheckCircle2, Plus } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface TaskBoardProps {
  expanded?: boolean
}

const columns = [
  {
    title: "To Do",
    count: 8,
    tasks: [
      { id: 1, title: "Update smart contract documentation", status: "pending", priority: "high", assignee: "SC" },
      { id: 2, title: "Review pull request #234", status: "pending", priority: "medium", assignee: "MJ" },
      { id: 3, title: "Design new landing page", status: "pending", priority: "low", assignee: "EW" },
    ],
  },
  {
    title: "In Progress",
    count: 5,
    tasks: [
      { id: 4, title: "Implement wallet integration", status: "in-progress", priority: "high", assignee: "SC" },
      { id: 5, title: "Optimize gas usage", status: "in-progress", priority: "high", assignee: "DP" },
    ],
  },
  {
    title: "Review",
    count: 3,
    tasks: [
      { id: 6, title: "Test token transfer flow", status: "review", priority: "medium", assignee: "MJ" },
      { id: 7, title: "Security audit findings", status: "review", priority: "high", assignee: "EW" },
    ],
  },
  {
    title: "Done",
    count: 12,
    tasks: [{ id: 8, title: "Deploy to testnet", status: "completed", priority: "high", assignee: "SC" }],
  },
]

const priorityColors = {
  high: "bg-destructive/10 text-destructive",
  medium: "bg-warning/10 text-warning",
  low: "bg-accent/10 text-accent",
}

export function TaskBoard({ expanded = false }: TaskBoardProps) {
  const displayColumns = expanded ? columns : columns

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Task Board</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage your project workflow</p>
        </div>
        {!expanded && (
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            New Task
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 overflow-x-auto pb-4">
        {displayColumns.map((column) => (
          <div key={column.title} className="bg-card border border-border rounded-lg p-4 min-w-80 md:min-w-0">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground">{column.title}</h3>
                <Badge variant="outline">{column.count}</Badge>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-3">
              {column.tasks.map((task) => (
                <Card key={task.id} className="p-3 hover:border-primary/50 cursor-pointer transition-colors">
                  <div className="flex items-start gap-2 mb-2">
                    {task.status === "completed" ? (
                      <CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                    ) : (
                      <Circle className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                    )}
                    <p
                      className={cn(
                        "text-sm leading-relaxed flex-1",
                        task.status === "completed" && "line-through text-muted-foreground",
                      )}
                    >
                      {task.title}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <Badge className={priorityColors[task.priority as keyof typeof priorityColors]}>
                      {task.priority}
                    </Badge>
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                      <span className="text-xs text-primary-foreground font-medium">{task.assignee}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <Button variant="outline" className="w-full mt-3 gap-2 bg-transparent">
              <Plus className="w-4 h-4" />
              Add Task
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
