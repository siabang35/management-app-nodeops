"use client"

import { useState } from "react"
import { LayoutGrid, LayoutList, Calendar, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { KanbanBoard } from "@/components/dashboard/kanban-board"
import { TableView } from "@/components/dashboard/table-view"
import { CalendarView } from "@/components/dashboard/calendar-view"
import { GalleryView } from "@/components/dashboard/gallery-view"

type ViewType = "kanban" | "table" | "calendar" | "gallery"

interface DatabaseViewProps {
  title: string
  items: any[]
  onTaskMove?: (taskId: string, newStatus: string) => void
  onTaskEdit?: (task: any) => void
  onTaskDelete?: (taskId: string) => void
  onAddTask?: (status: string) => void
}

export function DatabaseView({ title, items, onTaskMove, onTaskEdit, onTaskDelete, onAddTask }: DatabaseViewProps) {
  const [viewType, setViewType] = useState<ViewType>("kanban")

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{title}</h2>
        <div className="flex gap-2">
          <Button
            variant={viewType === "kanban" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewType("kanban")}
            className="gap-2"
          >
            <LayoutGrid className="w-4 h-4" />
            Kanban
          </Button>
          <Button
            variant={viewType === "table" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewType("table")}
            className="gap-2"
          >
            <LayoutList className="w-4 h-4" />
            Table
          </Button>
          <Button
            variant={viewType === "calendar" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewType("calendar")}
            className="gap-2"
          >
            <Calendar className="w-4 h-4" />
            Calendar
          </Button>
          <Button
            variant={viewType === "gallery" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewType("gallery")}
            className="gap-2"
          >
            <ImageIcon className="w-4 h-4" />
            Gallery
          </Button>
        </div>
      </div>

      {viewType === "kanban" && (
        <KanbanBoard
          tasks={items}
          onTaskMove={onTaskMove}
          onTaskEdit={onTaskEdit}
          onTaskDelete={onTaskDelete}
          onAddTask={onAddTask}
        />
      )}

      {viewType === "table" && <TableView tasks={items} onTaskEdit={onTaskEdit} onTaskDelete={onTaskDelete} />}

      {viewType === "calendar" && <CalendarView tasks={items} />}

      {viewType === "gallery" && <GalleryView tasks={items} onTaskEdit={onTaskEdit} onTaskDelete={onTaskDelete} />}
    </div>
  )
}
