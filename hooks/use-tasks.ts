"use client"

import { useState, useEffect, useCallback } from "react"
import { taskService, type Task } from "@/lib/db-service"

export function useTasks(projectId: string) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true)
      const data = await taskService.getTasks(projectId)
      setTasks(data)
      // Save to localStorage for offline access
      localStorage.setItem(`tasks_${projectId}`, JSON.stringify(data))
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch tasks"))
      // Try to load from localStorage on error
      const cached = localStorage.getItem(`tasks_${projectId}`)
      if (cached) setTasks(JSON.parse(cached))
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const addTask = useCallback(async (task: Omit<Task, "id" | "created_at" | "updated_at">) => {
    try {
      const newTask = await taskService.createTask(task)
      setTasks((prev) => [newTask, ...prev])
      return newTask
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to create task"))
      throw err
    }
  }, [])

  const updateTask = useCallback(async (taskId: string, updates: Partial<Task>) => {
    try {
      const updated = await taskService.updateTask(taskId, updates)
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)))
      return updated
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to update task"))
      throw err
    }
  }, [])

  const deleteTask = useCallback(async (taskId: string) => {
    try {
      await taskService.deleteTask(taskId)
      setTasks((prev) => prev.filter((t) => t.id !== taskId))
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to delete task"))
      throw err
    }
  }, [])

  return { tasks, loading, error, addTask, updateTask, deleteTask, refetch: fetchTasks }
}
