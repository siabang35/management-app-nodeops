"use client"

import { Card } from "@/components/ui/card"
import { LineChart, PieChart } from "lucide-react"

interface AnalyticsChartsProps {
  expanded?: boolean
}

export function AnalyticsCharts({ expanded = false }: AnalyticsChartsProps) {
  const revenueData = [
    { month: "Jan", value: 65, target: 70 },
    { month: "Feb", value: 78, target: 75 },
    { month: "Mar", value: 82, target: 80 },
    { month: "Apr", value: 71, target: 85 },
    { month: "May", value: 88, target: 90 },
    { month: "Jun", value: 95, target: 95 },
  ]

  const taskCompletionData = [
    { status: "Completed", value: 156, percentage: 65 },
    { status: "In Progress", value: 48, percentage: 20 },
    { status: "Pending", value: 36, percentage: 15 },
  ]

  const maxRevenue = Math.max(...revenueData.map((d) => d.value))

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Revenue Trend Chart */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Revenue Trend</h3>
            <p className="text-sm text-muted-foreground mt-1">Monthly revenue vs target</p>
          </div>
          <LineChart className="w-5 h-5 text-muted-foreground" />
        </div>

        <div className="space-y-4">
          {revenueData.map((item) => (
            <div key={item.month} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{item.month}</span>
                <span className="font-semibold text-foreground">${item.value}k</span>
              </div>
              <div className="flex gap-2">
                <div className="flex-1 bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full"
                    style={{ width: `${(item.value / maxRevenue) * 100}%` }}
                  />
                </div>
                <div className="flex-1 bg-muted rounded-full h-2">
                  <div
                    className="bg-accent/50 h-2 rounded-full"
                    style={{ width: `${(item.target / maxRevenue) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t border-border flex gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-xs text-muted-foreground">Actual</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-accent/50" />
            <span className="text-xs text-muted-foreground">Target</span>
          </div>
        </div>
      </Card>

      {/* Task Completion Distribution */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Task Distribution</h3>
            <p className="text-sm text-muted-foreground mt-1">Tasks by status</p>
          </div>
          <PieChart className="w-5 h-5 text-muted-foreground" />
        </div>

        <div className="space-y-4">
          {taskCompletionData.map((item) => (
            <div key={item.status} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{item.status}</span>
                <span className="font-semibold text-foreground">
                  {item.value} ({item.percentage}%)
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    item.status === "Completed"
                      ? "bg-accent"
                      : item.status === "In Progress"
                        ? "bg-primary"
                        : "bg-warning"
                  }`}
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t border-border">
          <div className="text-sm">
            <span className="text-muted-foreground">Total Tasks: </span>
            <span className="font-semibold text-foreground">
              {taskCompletionData.reduce((sum, item) => sum + item.value, 0)}
            </span>
          </div>
        </div>
      </Card>
    </div>
  )
}
