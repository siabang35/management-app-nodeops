"use client"

import { useState, useEffect } from "react"
import { Plus, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TaskBoard } from "@/components/dashboard/task-board"
import { TaskFilters } from "@/components/dashboard/task-filters"
import { TaskModal } from "@/components/modals/task-modal"
import { DatabaseView } from "@/components/views/database-view"
import { getTasks, createTask } from "@/app/actions/tasks"
import { useToast } from "@/hooks/use-toast"

export function TasksView() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [viewType] = useState<"kanban" | "table" | "calendar" | "gallery">("kanban")
  // const [sortBy, setSortBy] = useState("created_at")
  const [tasks, setTasks] = useState<any[]>([])
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
      const result = await getTasks();
      const typedResult = result as { error?: string; data?: any[] };
      if (typedResult.error) {
        console.error("Failed to load tasks:", typedResult.error)
        setError("Failed to load tasks")
        toast({
          title: "Error loading tasks",
          description: typedResult.error,
          variant: "destructive",
        })
      } else {
        setTasks(typedResult.data || [])
      }
    } catch (err: any) {
      console.error("Error loading tasks:", err)
      setError("Failed to load tasks")
      toast({
        title: "Error loading tasks",
        description: err.message || "Unknown error",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateTask = async (taskData: any) => {
    try {
      const result = await createTask({
        ...taskData,
        created_at: new Date().toISOString(),
      })

      const typedResult = result as { error?: string; [key: string]: any };

      if (typedResult.error) {
        throw new Error(typedResult.error)
      }

      // Reload tasks to show the new one
      await loadTasks()

      toast({
        title: "Task created",
        description: "New task has been created successfully.",
      })

      setIsModalOpen(false)
    } catch (err: any) {
      console.error("Failed to create task:", err)
      toast({
        title: "Failed to create task",
        description: err.message || "Unknown error",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 space-y-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading tasks...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 lg:p-8 space-y-6">
        <div className="text-center py-12">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={loadTasks} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  function setFilters(filters: any): void {
    setFilters(filters)
  }

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

      <TaskFilters onFilterChange={setFilters} onSortChange={() => {}} />
      <TaskFilters onFilterChange={() => {}} onSortChange={() => {}} />
      {viewType === "kanban" && <TaskBoard expanded />}
      {viewType === "table" && <DatabaseView title="Tasks" items={tasks} />}

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateTask}
      />
    </div>
  )
}
