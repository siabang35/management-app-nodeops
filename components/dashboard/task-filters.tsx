"use client"

import { useState } from "react"
import { Search, Filter, SortAsc, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"

interface TaskFiltersProps {
  onFilterChange: (filters: any) => void
  onSortChange: (sort: string) => void
}

export function TaskFilters({ onFilterChange, onSortChange }: TaskFiltersProps) {
  const [showFilters, setShowFilters] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPriority, setSelectedPriority] = useState<string[]>([])
  const [selectedStatus, setSelectedStatus] = useState<string[]>([])
  const [selectedAssignee, setSelectedAssignee] = useState<string[]>([])
  const [sortBy, setSortBy] = useState("created_at")

  const handlePriorityToggle = (priority: string) => {
    const updated = selectedPriority.includes(priority)
      ? selectedPriority.filter((p) => p !== priority)
      : [...selectedPriority, priority]
    setSelectedPriority(updated)
    onFilterChange({ priority: updated, status: selectedStatus, assignee: selectedAssignee, search: searchQuery })
  }

  const handleStatusToggle = (status: string) => {
    const updated = selectedStatus.includes(status)
      ? selectedStatus.filter((s) => s !== status)
      : [...selectedStatus, status]
    setSelectedStatus(updated)
    onFilterChange({ priority: selectedPriority, status: updated, assignee: selectedAssignee, search: searchQuery })
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    onFilterChange({ priority: selectedPriority, status: selectedStatus, assignee: selectedAssignee, search: query })
  }

  const handleSort = (sort: string) => {
    setSortBy(sort)
    onSortChange(sort)
  }

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedPriority([])
    setSelectedStatus([])
    setSelectedAssignee([])
    onFilterChange({ priority: [], status: [], assignee: [], search: "" })
  }

  const activeFiltersCount = selectedPriority.length + selectedStatus.length + selectedAssignee.length

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search tasks..."
            className="pl-10"
          />
        </div>
        <Button
          variant={showFilters ? "default" : "outline"}
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="gap-2"
        >
          <Filter className="w-4 h-4" />
          Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleSort(sortBy === "created_at" ? "due_date" : "created_at")}
          className="gap-2"
        >
          <SortAsc className="w-4 h-4" />
          Sort
        </Button>
      </div>

      {showFilters && (
        <Card className="p-4 space-y-4">
          <div>
            <h4 className="font-semibold text-sm mb-2">Priority</h4>
            <div className="flex gap-2">
              {["low", "medium", "high"].map((priority) => (
                <Button
                  key={priority}
                  variant={selectedPriority.includes(priority) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePriorityToggle(priority)}
                  className="capitalize"
                >
                  {priority}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-2">Status</h4>
            <div className="flex gap-2 flex-wrap">
              {["todo", "in-progress", "review", "done"].map((status) => (
                <Button
                  key={status}
                  variant={selectedStatus.includes(status) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleStatusToggle(status)}
                  className="capitalize"
                >
                  {status}
                </Button>
              ))}
            </div>
          </div>

          {activeFiltersCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="w-full gap-2">
              <X className="w-4 h-4" />
              Clear Filters
            </Button>
          )}
        </Card>
      )}
    </div>
  )
}
