"use client"

import { useState } from "react"
import { Bold, Italic, Underline, Code, LinkIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function RichTextEditor({ value, onChange, placeholder = "Start typing..." }: RichTextEditorProps) {
  const [isFocused, setIsFocused] = useState(false)

  const applyFormat = (format: string) => {
    const textarea = document.querySelector("textarea") as HTMLTextAreaElement
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)
    const beforeText = value.substring(0, start)
    const afterText = value.substring(end)

    let formattedText = ""
    switch (format) {
      case "bold":
        formattedText = `**${selectedText}**`
        break
      case "italic":
        formattedText = `*${selectedText}*`
        break
      case "underline":
        formattedText = `__${selectedText}__`
        break
      case "code":
        formattedText = `\`${selectedText}\``
        break
      case "link":
        formattedText = `[${selectedText}](url)`
        break
      default:
        formattedText = selectedText
    }

    onChange(beforeText + formattedText + afterText)
  }

  return (
    <div className="space-y-2">
      {isFocused && (
        <div className="flex gap-1 p-2 bg-muted rounded-lg border border-border">
          <Button size="sm" variant="ghost" onClick={() => applyFormat("bold")} className="h-8 w-8 p-0">
            <Bold className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => applyFormat("italic")} className="h-8 w-8 p-0">
            <Italic className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => applyFormat("underline")} className="h-8 w-8 p-0">
            <Underline className="w-4 h-4" />
          </Button>
          <div className="w-px bg-border" />
          <Button size="sm" variant="ghost" onClick={() => applyFormat("code")} className="h-8 w-8 p-0">
            <Code className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => applyFormat("link")} className="h-8 w-8 p-0">
            <LinkIcon className="w-4 h-4" />
          </Button>
        </div>
      )}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        className="w-full min-h-32 p-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
      />
    </div>
  )
}
