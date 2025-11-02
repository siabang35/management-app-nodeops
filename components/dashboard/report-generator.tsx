"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { FileText, Download, Calendar, BarChart3 } from "lucide-react"
import { toast } from "sonner"

interface ReportGeneratorProps {
  expanded?: boolean
}

export function ReportGenerator({ expanded = false }: ReportGeneratorProps) {
  const [reportType, setReportType] = useState("")
  const [dateRange, setDateRange] = useState("")
  const [includeCharts, setIncludeCharts] = useState(true)
  const [includeMetrics, setIncludeMetrics] = useState(true)
  const [includeLeaderboard, setIncludeLeaderboard] = useState(false)
  const [generating, setGenerating] = useState(false)

  const reportTypes = [
    { value: "performance", label: "Performance Report", description: "Detailed performance metrics and analytics" },
    { value: "activity", label: "Activity Report", description: "Task completion and activity summary" },
    { value: "leaderboard", label: "Leaderboard Report", description: "Top ambassadors ranking and statistics" },
    { value: "comprehensive", label: "Comprehensive Report", description: "All metrics, activities, and rankings" },
  ]

  const dateRanges = [
    { value: "7d", label: "Last 7 days" },
    { value: "30d", label: "Last 30 days" },
    { value: "90d", label: "Last 90 days" },
    { value: "custom", label: "Custom range" },
  ]

  const handleGenerateReport = async () => {
    if (!reportType || !dateRange) {
      toast.error("Please select report type and date range")
      return
    }

    setGenerating(true)

    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000))

      toast.success("Report generated successfully!")

      // In a real implementation, this would trigger a download
      // For now, we'll just show a success message

    } catch (error) {
      console.error("Error generating report:", error)
      toast.error("Failed to generate report")
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Report Generator</h2>
          <p className="text-sm text-muted-foreground mt-1">Generate detailed reports for your ambassador activities</p>
        </div>
        <FileText className="w-6 h-6 text-muted-foreground" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Report Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Report Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="report-type">Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div>
                        <div className="font-medium">{type.label}</div>
                        <div className="text-xs text-muted-foreground">{type.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date-range">Date Range</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent>
                  {dateRanges.map((range) => (
                    <SelectItem key={range.value} value={range.value}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {dateRange === "custom" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start-date">Start Date</Label>
                  <Input id="start-date" type="date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-date">End Date</Label>
                  <Input id="end-date" type="date" />
                </div>
              </div>
            )}

            <div className="space-y-4">
              <Label>Include Sections</Label>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-charts"
                    checked={includeCharts}
                    onCheckedChange={setIncludeCharts}
                  />
                  <Label htmlFor="include-charts" className="text-sm">Charts and visualizations</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-metrics"
                    checked={includeMetrics}
                    onCheckedChange={setIncludeMetrics}
                  />
                  <Label htmlFor="include-metrics" className="text-sm">Key performance metrics</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-leaderboard"
                    checked={includeLeaderboard}
                    onCheckedChange={setIncludeLeaderboard}
                  />
                  <Label htmlFor="include-leaderboard" className="text-sm">Ambassador leaderboard</Label>
                </div>
              </div>
            </div>

            <Button
              onClick={handleGenerateReport}
              disabled={generating || !reportType || !dateRange}
              className="w-full"
            >
              {generating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Generating Report...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Generate Report
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Report Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Report Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border rounded-lg p-4 bg-muted/50">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Ambassador Performance Report</h4>
                    <span className="text-xs text-muted-foreground">Generated: {new Date().toLocaleDateString()}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Report Type:</span>
                      <p className="font-medium">{reportTypes.find(t => t.value === reportType)?.label || "Not selected"}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Date Range:</span>
                      <p className="font-medium">{dateRanges.find(r => r.value === dateRange)?.label || "Not selected"}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Included sections:</p>
                    <div className="flex flex-wrap gap-2">
                      {includeCharts && <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded">Charts</span>}
                      {includeMetrics && <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded">Metrics</span>}
                      {includeLeaderboard && <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded">Leaderboard</span>}
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">
                  Configure your report settings and click "Generate Report" to download
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Recent Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No recent reports</p>
            <p className="text-sm text-muted-foreground mt-1">Generated reports will appear here</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
