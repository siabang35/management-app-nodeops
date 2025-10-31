"use client"

import Image from "next/image"
import { Home, CheckSquare, BarChart3, Users, FileText, Settings, LogOut, Zap } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface SidebarProps {
  activeView: string
  setActiveView: (view: string) => void
  isOpen: boolean
}

const navigation = [
  { name: "Dashboard", icon: Home, id: "dashboard" },
  { name: "Tasks", icon: CheckSquare, id: "tasks" },
  { name: "Analytics", icon: BarChart3, id: "analytics" },
  { name: "Team", icon: Users, id: "team" },
  { name: "Reports", icon: FileText, id: "reports" },
  { name: "Settings", icon: Settings, id: "settings" },
]

export function Sidebar({ activeView, setActiveView, isOpen }: SidebarProps) {
  return (
    <aside
      className={cn(
        "fixed md:relative w-64 h-screen bg-card border-r border-border flex flex-col transition-all duration-300 z-40",
        "bg-gradient-to-b from-card via-card to-card/80",
        !isOpen && "-translate-x-full md:translate-x-0",
      )}
    >
      <div className="h-16 border-b border-border/50 px-6 flex items-center justify-between bg-gradient-to-r from-primary/10 via-transparent to-accent/10 animate-slide-in-left">
        <div className="flex items-center gap-3 group">
          <div className="w-10 h-10 relative animate-rotate-in">
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-lg opacity-0 group-hover:opacity-100 blur transition-opacity duration-300" />
            <Image src="/logo.svg" alt="NodeOps" width={40} height={40} className="w-full h-full relative z-10" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors duration-300">
              NodeOps
            </h1>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Zap className="w-3 h-3 text-accent" />
              Web3 Platform
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navigation.map((item, index) => {
          const Icon = item.icon
          const isActive = activeView === item.id

          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              style={{
                animationDelay: `${index * 50}ms`,
              }}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-300 group relative overflow-hidden",
                "animate-slide-in-left",
                isActive
                  ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/50 neon-border"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
              )}
            >
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 animate-gradient-shift" />
              )}
              <Icon
                className={cn(
                  "w-5 h-5 flex-shrink-0 relative z-10 transition-all duration-300",
                  isActive && "group-hover:scale-110 animate-glow-pulse",
                )}
              />
              <span className="relative z-10">{item.name}</span>
            </button>
          )
        })}
      </nav>

      <div className="border-t border-border/50 p-4 space-y-3 bg-gradient-to-t from-primary/5 to-transparent">
        <div className="glass-effect rounded-lg p-3 hover-lift animate-slide-in-up">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center flex-shrink-0 animate-glow-pulse">
              <span className="text-primary-foreground font-semibold text-sm">JD</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground text-sm truncate">John Doe</p>
              <p className="text-xs text-muted-foreground truncate">john@nodeops.io</p>
            </div>
          </div>
        </div>
        <Button
          variant="outline"
          className="w-full gap-2 bg-transparent hover:bg-muted/50 hover:neon-border transition-all duration-300"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </div>
    </aside>
  )
}
