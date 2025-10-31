"use client"

import { useState } from "react"
import { X, Plus, Calendar, Tag, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { RichTextEditor } from "@/components/editor/rich-text-editor"

interface TaskModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit?: (task: any) => void
}

export function TaskModal({ isOpen, onClose, onSubmit }: TaskModalProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState("medium")
  const [status, setStatus] = useState("todo")
  const [assignee, setAssignee] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [attachments, setAttachments] = useState<string[]>([])

  if (!isOpen) return null

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput)) {
      setTags([...tags, tagInput])
      setTagInput("")
    }
  }

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag))
  }

  const handleSubmit = () => {
    if (!title.trim()) return

    const task = {
      title,
      description,
      priority,
      status,
      assignee_id: assignee,
      due_date: dueDate || null,
      tags,
      attachments,
    }

    onSubmit?.(task)

    // Reset form
    setTitle("")
    setDescription("")
    setPriority("medium")
    setStatus("todo")
    setAssignee("")
    setDueDate("")
    setTags([])
    setAttachments([])
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground">Create New Task</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="space-y-6">
          {/* Title */}
          <div>
            <label className="text-sm font-semibold text-foreground">Task Title *</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title..."
              className="mt-2"
            />
          </div>

          {/* Description with Rich Text Editor */}
          <div>
            <label className="text-sm font-semibold text-foreground">Description</label>
            <RichTextEditor
              value={description}
              onChange={setDescription}
              placeholder="Add task description, notes, or details..."
            />
          </div>

          {/* Priority and Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-foreground">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="mt-2 w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold text-foreground">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="mt-2 w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
              >
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="review">Review</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>

          {/* Assignee and Due Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Users className="w-4 h-4" />
                Assignee
              </label>
              <select
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                className="mt-2 w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
              >
                <option value="">Select assignee...</option>
                <option value="user-1">Sarah Chen</option>
                <option value="user-2">Mike Johnson</option>
                <option value="user-3">Emma Wilson</option>
                <option value="user-4">David Park</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="mt-2 w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Tags
            </label>
            <div className="mt-2 flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAddTag()}
                placeholder="Add tag and press Enter..."
              />
              <Button onClick={handleAddTag} variant="outline" size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <div
                    key={tag}
                    className="flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                  >
                    {tag}
                    <button onClick={() => handleRemoveTag(tag)} className="hover:text-primary/70">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-border">
            <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="flex-1">
              Create Task
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
