"use client"

import { useState, useCallback } from "react"
import { apiClient } from "@/lib/api-client"

export function useApi() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTasks = useCallback(async (filters?: any) => {
    setLoading(true)
    setError(null)
    try {
      const data = await apiClient.getTasks(filters)
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch tasks")
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  const createTask = useCallback(async (taskData: any) => {
    setLoading(true)
    setError(null)
    try {
      const data = await apiClient.createTask(taskData)
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create task")
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const updateTask = useCallback(async (id: string, taskData: any) => {
    setLoading(true)
    setError(null)
    try {
      const data = await apiClient.updateTask(id, taskData)
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update task")
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteTask = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      const data = await apiClient.deleteTask(id)
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete task")
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const getTeamMembers = useCallback(async (role?: string) => {
    setLoading(true)
    setError(null)
    try {
      const data = await apiClient.getTeamMembers(role)
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch team members")
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  const downloadReportPDF = useCallback(async (reportType: string, startDate: string, endDate: string) => {
    setLoading(true)
    setError(null)
    try {
      if (reportType === "revenue") {
        await apiClient.downloadRevenueReportPDF(startDate, endDate)
      } else if (reportType === "tasks") {
        await apiClient.downloadTaskReportPDF(startDate, endDate)
      } else if (reportType === "team") {
        await apiClient.downloadTeamReportPDF(startDate, endDate)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to download report")
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    getTeamMembers,
    downloadReportPDF,
  }
}
