import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

export function formatDateTime(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function getRelativeTime(date: string | Date): string {
  const d = new Date(date)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - d.getTime()) / 1000)

  if (seconds < 60) return "just now"
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`

  return formatDate(d)
}

export function getPriorityColor(priority: string): string {
  switch (priority) {
    case "high":
      return "bg-red-500/20 text-red-400"
    case "medium":
      return "bg-yellow-500/20 text-yellow-400"
    case "low":
      return "bg-green-500/20 text-green-400"
    default:
      return "bg-gray-500/20 text-gray-400"
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "done":
      return "bg-green-500/20 text-green-400"
    case "in-progress":
      return "bg-blue-500/20 text-blue-400"
    case "review":
      return "bg-purple-500/20 text-purple-400"
    case "todo":
      return "bg-gray-500/20 text-gray-400"
    default:
      return "bg-gray-500/20 text-gray-400"
  }
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}
