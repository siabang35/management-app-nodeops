"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { DashboardView } from "@/components/views/dashboard-view"
import { TasksView } from "@/components/views/tasks-view"
import { AnalyticsView } from "@/components/views/analytics-view"
import { TeamView } from "@/components/views/team-view"
import { ReportsView } from "@/components/views/reports-view"

type ViewType = "dashboard" | "tasks" | "analytics" | "team" | "reports" | "settings"

export default function Home() {
  const [activeView, setActiveView] = useState<ViewType>("dashboard")
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    // Load user preferences from localStorage
    const savedView = localStorage.getItem("activeView") as ViewType
    if (savedView) setActiveView(savedView)
  }, [])

  useEffect(() => {
    // Save active view to localStorage
    localStorage.setItem("activeView", activeView)
  }, [activeView])

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar activeView={activeView} setActiveView={setActiveView} isOpen={sidebarOpen} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 overflow-y-auto">
          {activeView === "dashboard" && <DashboardView />}
          {activeView === "tasks" && <TasksView />}
          {activeView === "analytics" && <AnalyticsView />}
          {activeView === "team" && <TeamView />}
          {activeView === "reports" && <ReportsView />}
        </main>
      </div>
    </div>
  )
}
