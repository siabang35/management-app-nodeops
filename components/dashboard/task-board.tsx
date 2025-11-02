"use client"

import { useState, useEffect } from "react"
import { MoreVertical, Circle, CheckCircle2, Plus, Loader2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { getTasks } from "@/app/actions/tasks"
import { useToast } from "@/hooks/use-toast"

interface TaskBoardProps {
  expanded?: boolean
}

interface Task {
  id: string
  title: string
  status: string
  priority: string
  assignee?: string
  created_at?: string
}

interface Column {
  title: string
  count: number
  tasks: Task[]
}

export function TaskBoard({ expanded = false }: TaskBoardProps) {
  const [columns, setColumns] = useState<Column[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  // Load tasks on component mount
  useEffect(() => {
    loadTasks()
  }, [])

  const loadTasks = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const result = await getTasks()
      // Type guard for result
      if (typeof result === "object" && result !== null && "error" in result) {
        if ((result as any).error) {
          console.error("Failed to load tasks:", (result as any).error)
          setError("Failed to load tasks")
          toast({
            title: "Error loading tasks",
            description: (result as any).error,
            variant: "destructive",
          })
          // Fallback to empty columns
          setColumns([
            { title: "To Do", count: 0, tasks: [] },
            { title: "In Progress", count: 0, tasks: [] },
            { title: "Review", count: 0, tasks: [] },
            { title: "Done", count: 0, tasks: [] },
          ])
        } else {
          // Group tasks by status
          const tasks = (result as any).data || []
          const groupedTasks = {
            "To Do": tasks.filter((task: Task) => task.status === "pending" || task.status === "todo"),
            "In Progress": tasks.filter((task: Task) => task.status === "in-progress" || task.status === "in_progress"),
            "Review": tasks.filter((task: Task) => task.status === "review"),
            "Done": tasks.filter((task: Task) => task.status === "completed" || task.status === "done"),
          }

          const newColumns: Column[] = [
            { title: "To Do", count: groupedTasks["To Do"].length, tasks: groupedTasks["To Do"] },
            { title: "In Progress", count: groupedTasks["In Progress"].length, tasks: groupedTasks["In Progress"] },
            { title: "Review", count: groupedTasks["Review"].length, tasks: groupedTasks["Review"] },
            { title: "Done", count: groupedTasks["Done"].length, tasks: groupedTasks["Done"] },
          ]

          setColumns(newColumns)
        }
      }
    } catch (err: any) {
      console.error("Error loading tasks:", err)
      setError("Failed to load tasks")
      toast({
        title: "Error loading tasks",
        description: err.message || "Unknown error",
        variant: "destructive",
      })
      // Fallback to empty columns
      setColumns([
        { title: "To Do", count: 0, tasks: [] },
        { title: "In Progress", count: 0, tasks: [] },
        { title: "Review", count: 0, tasks: [] },
        { title: "Done", count: 0, tasks: [] },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const priorityColors = {
    high: "bg-destructive/10 text-destructive",
    medium: "bg-warning/10 text-warning",
    low: "bg-accent/10 text-accent",
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Task Board</h2>
            <p className="text-sm text-muted-foreground mt-1">Manage your project workflow</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Loading tasks...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Task Board</h2>
            <p className="text-sm text-muted-foreground mt-1">Manage your project workflow</p>
          </div>
        </div>
        <div className="text-center py-12">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={loadTasks} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

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
                    {task.status === "completed" || task.status === "done" ? (
                      <CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                    ) : (
                      <Circle className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                    )}
                    <p
                      className={cn(
                        "text-sm leading-relaxed flex-1",
                        task.status === "completed" || task.status === "done" && "line-through text-muted-foreground",
                      )}
                    >
                      {task.title}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <Badge className={priorityColors[task.priority as keyof typeof priorityColors] || priorityColors.medium}>
                      {task.priority || "medium"}
                    </Badge>
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                      <span className="text-xs text-primary-foreground font-medium">
                        {(task.assignee || "U").slice(0, 2).toUpperCase()}
                      </span>
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
