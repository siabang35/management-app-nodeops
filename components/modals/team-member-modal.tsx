"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"

interface TeamMemberModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit?: (member: any) => void
  initialData?: any
}

export function TeamMemberModal({ isOpen, onClose, onSubmit, initialData }: TeamMemberModalProps) {
  const [name, setName] = useState(initialData?.name || "")
  const [email, setEmail] = useState(initialData?.email || "")
  const [role, setRole] = useState(initialData?.role || "member")
  const [status, setStatus] = useState(initialData?.status || "online")

  if (!isOpen) return null

  const handleSubmit = () => {
    if (!name.trim() || !email.trim()) return

    const member = {
      name,
      email,
      role,
      status,
    }

    onSubmit?.(member)
    setName("")
    setEmail("")
    setRole("member")
    setStatus("online")
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">{initialData ? "Edit Team Member" : "Add Team Member"}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-foreground">Name *</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter member name..."
              className="mt-2"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-foreground">Email *</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address..."
              className="mt-2"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-foreground">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="mt-2 w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
            >
              <option value="member">Member</option>
              <option value="moderator">Moderator</option>
              <option value="ambassador">Ambassador</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-semibold text-foreground">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="mt-2 w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
            >
              <option value="online">Online</option>
              <option value="away">Away</option>
              <option value="offline">Offline</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4 border-t border-border">
            <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="flex-1">
              {initialData ? "Update" : "Add"} Member
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
