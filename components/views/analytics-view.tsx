"use client"

import { BarChart3, TrendingUp, Users, Activity, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { RevenueChart } from "@/components/dashboard/revenue-chart"
import { AnalyticsCharts } from "@/components/dashboard/analytics-charts"
import { PerformanceMetrics } from "@/components/dashboard/performance-metrics"

const teamMembers = [
  { id: 1, name: "Sarah Chen", role: "Moderator", performance: 95, tasks: 12 },
  { id: 2, name: "Mike Johnson", role: "Ambassador", performance: 88, tasks: 8 },
  { id: 3, name: "Emma Wilson", role: "Ambassador", performance: 92, tasks: 6 },
  { id: 4, name: "David Park", role: "Moderator", performance: 85, tasks: 4 },
]

export function AnalyticsView() {
  const stats = [
    { label: "Total Revenue", value: "$124,592", change: "+12.5%", icon: BarChart3 },
    { label: "Active Users", value: "2,847", change: "+8.2%", icon: Users },
    { label: "Growth Rate", value: "23.5%", change: "+5.1%", icon: TrendingUp },
    { label: "Network Activity", value: "98.4%", change: "+2.4%", icon: Activity },
  ]

  const handleExportPDF = () => {
    console.log("Exporting analytics to PDF...")
    // PDF export logic will be implemented
  }

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics & Reports</h1>
          <p className="mt-2 text-muted-foreground">Detailed insights into your project performance</p>
        </div>
        <Button onClick={handleExportPDF} className="gap-2">
          <Download className="w-4 h-4" />
          Export PDF
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Icon className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium text-accent">{stat.change}</span>
              </div>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </Card>
          )
        })}
      </div>

      {/* Revenue Chart */}
      <RevenueChart expanded />

      {/* Analytics Charts */}
      <AnalyticsCharts expanded />

      {/* Performance Metrics */}
      <PerformanceMetrics teamMembers={teamMembers} />
    </div>
  )
}
