"use client"

import { Search, Bell, Menu, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PdfExportButton } from "@/components/dashboard/pdf-export-button"

interface HeaderProps {
  onMenuClick: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const today = new Date().toISOString().split("T")[0]
  const lastMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]

  return (
    <header className="h-16 border-b border-border/50 bg-card sticky top-0 z-30 backdrop-blur-md bg-gradient-to-r from-card via-card/95 to-card/90">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 opacity-0 hover:opacity-100 transition-opacity duration-300" />

      <div className="h-full px-6 flex items-center justify-between gap-4 relative z-10">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="md:hidden hover:bg-muted/50 transition-all duration-300"
        >
          <Menu className="w-5 h-5" />
        </Button>

        <div className="flex-1 max-w-xl animate-slide-in-left">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-300" />
            <Input
              placeholder="Search tasks, projects, team members..."
              className="pl-10 glass-effect hover:glass-effect-dark transition-all duration-300 focus:neon-border"
            />
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/0 via-primary/5 to-accent/0 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
          </div>
        </div>

        <div className="flex items-center gap-2 animate-slide-in-right">
          <PdfExportButton reportType="revenue" startDate={lastMonth} endDate={today} />

          <Button variant="ghost" size="icon" className="relative hover:bg-muted/50 transition-all duration-300 group">
            <Bell className="w-5 h-5 group-hover:animate-bounce-smooth" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-accent rounded-full animate-pulse-ring"></span>
          </Button>

          <div className="hidden sm:flex items-center gap-3 ml-2 pl-2 border-l border-border/50 glass-effect px-3 py-1 rounded-lg hover-lift">
            <div className="text-right">
              <div className="text-sm font-medium text-foreground">Alex Rivera</div>
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Zap className="w-3 h-3 text-accent" />
                Admin
              </div>
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center animate-glow-pulse">
              <span className="text-primary-foreground font-semibold text-sm">AR</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
