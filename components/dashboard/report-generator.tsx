"use client"

import { useState } from "react"
import { FileText, Calendar, Users, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

interface ReportGeneratorProps {
  onGenerate?: (report: any) => void
}

export function ReportGenerator({ onGenerate }: ReportGeneratorProps) {
  const [reportName, setReportName] = useState("")
  const [reportType, setReportType] = useState("revenue")
  const [dateRange, setDateRange] = useState("month")
  const [includeCharts, setIncludeCharts] = useState(true)
  const [includeTeamData, setIncludeTeamData] = useState(true)

  const reportTypes = [
    { id: "revenue", label: "Revenue Report", icon: TrendingUp, description: "Financial performance and trends" },
    { id: "tasks", label: "Task Report", icon: FileText, description: "Task completion and statistics" },
    { id: "team", label: "Team Report", icon: Users, description: "Team performance and activity" },
    { id: "comprehensive", label: "Comprehensive", icon: Calendar, description: "All metrics combined" },
  ]

  const handleGenerate = () => {
    if (!reportName.trim()) return

    const report = {
      name: reportName,
      type: reportType,
      dateRange,
      includeCharts,
      includeTeamData,
      generatedAt: new Date().toISOString(),
    }

    onGenerate?.(report)
    setReportName("")
  }

  return (
    <Card className="p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground">Generate New Report</h3>
        <p className="text-sm text-muted-foreground mt-1">Create custom reports with selected metrics</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-semibold text-foreground">Report Name</label>
          <Input
            value={reportName}
            onChange={(e) => setReportName(e.target.value)}
            placeholder="e.g., Q1 2024 Performance Report"
            className="mt-2"
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-foreground">Report Type</label>
          <div className="grid grid-cols-2 gap-3 mt-2">
            {reportTypes.map((type) => {
              const Icon = type.icon
              return (
                <button
                  key={type.id}
                  onClick={() => setReportType(type.id)}
                  className={`p-3 rounded-lg border-2 transition-all text-left ${
                    reportType === type.id ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="w-4 h-4" />
                    <span className="font-medium text-sm">{type.label}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{type.description}</p>
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-foreground">Date Range</label>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="mt-2 w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
          >
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="quarter">Last Quarter</option>
            <option value="year">Last Year</option>
            <option value="all">All Time</option>
          </select>
        </div>

        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={includeCharts}
              onChange={(e) => setIncludeCharts(e.target.checked)}
              className="w-4 h-4 rounded border-border"
            />
            <span className="text-sm font-medium text-foreground">Include Charts & Visualizations</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={includeTeamData}
              onChange={(e) => setIncludeTeamData(e.target.checked)}
              className="w-4 h-4 rounded border-border"
            />
            <span className="text-sm font-medium text-foreground">Include Team Performance Data</span>
          </label>
        </div>

        <Button onClick={handleGenerate} className="w-full">
          Generate & Download PDF
        </Button>
      </div>
    </Card>
  )
}
