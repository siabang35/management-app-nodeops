"use client"

import { useState } from "react"
import { X, Copy, Check, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  itemName: string
  itemType: "task" | "project" | "report"
}

export function ShareModal({ isOpen, onClose, itemName, itemType }: ShareModalProps) {
  const [shareLink, setShareLink] = useState(`https://nodeops.io/share/${Math.random().toString(36).substr(2, 9)}`)
  const [copied, setCopied] = useState(false)
  const [sharedWith, setSharedWith] = useState<string[]>([])
  const [emailInput, setEmailInput] = useState("")
  const [permission, setPermission] = useState("view")

  if (!isOpen) return null

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleAddEmail = () => {
    if (emailInput.trim() && !sharedWith.includes(emailInput)) {
      setSharedWith([...sharedWith, emailInput])
      setEmailInput("")
    }
  }

  const handleRemoveEmail = (email: string) => {
    setSharedWith(sharedWith.filter((e) => e !== email))
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">Share {itemType}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="space-y-6">
          {/* Share Link */}
          <div>
            <label className="text-sm font-semibold text-foreground">Share Link</label>
            <div className="mt-2 flex gap-2">
              <Input value={shareLink} readOnly className="text-sm" />
              <Button variant="outline" size="sm" onClick={handleCopyLink} className="gap-2 bg-transparent">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Permission Level */}
          <div>
            <label className="text-sm font-semibold text-foreground">Link Permission</label>
            <select
              value={permission}
              onChange={(e) => setPermission(e.target.value)}
              className="mt-2 w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
            >
              <option value="view">View Only</option>
              <option value="comment">Can Comment</option>
              <option value="edit">Can Edit</option>
            </select>
          </div>

          {/* Share with Email */}
          <div>
            <label className="text-sm font-semibold text-foreground">Share with Email</label>
            <div className="mt-2 flex gap-2">
              <Input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAddEmail()}
                placeholder="Enter email address..."
              />
              <Button variant="outline" size="sm" onClick={handleAddEmail} className="gap-2 bg-transparent">
                <Mail className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Shared With List */}
          {sharedWith.length > 0 && (
            <div>
              <label className="text-sm font-semibold text-foreground">Shared With</label>
              <div className="mt-2 space-y-2">
                {sharedWith.map((email) => (
                  <div key={email} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                    <span className="text-sm text-foreground">{email}</span>
                    <Button variant="ghost" size="sm" onClick={() => handleRemoveEmail(email)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-border">
            <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button onClick={onClose} className="flex-1">
              Done
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
