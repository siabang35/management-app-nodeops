"use client"

import { useState, useEffect } from "react"
import { BarChart3, TrendingUp, Users, Activity, Download, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { RevenueChart } from "@/components/dashboard/revenue-chart"
import { AnalyticsCharts } from "@/components/dashboard/analytics-charts"
import { PerformanceMetrics } from "@/components/dashboard/performance-metrics"
import { getKeyMetrics, getRevenueReport } from "@/app/actions/reports"
import { getTeamMembers } from "@/app/actions/team"
import { useToast } from "@/hooks/use-toast"

export function AnalyticsView() {
  const [keyMetrics, setKeyMetrics] = useState<any>(null)
  const [revenueData, setRevenueData] = useState<any[]>([])
  const [teamMembers, setTeamMembers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  // Load analytics data on component mount
  useEffect(() => {
    loadAnalyticsData()
  }, [])

  const loadAnalyticsData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Load key metrics
      const metricsResult = await getKeyMetrics()
      // Type guard for metricsResult
      if ((metricsResult as any).error) {
        console.error("Failed to load key metrics:", (metricsResult as any).error)
        setError("Failed to load key metrics")
        toast({
          title: "Error loading metrics",
          description: (metricsResult as any).error,
          variant: "destructive",
        })
      } else {
        setKeyMetrics((metricsResult as any).data)
      }

      // Load revenue data for the last 30 days
      const endDate = new Date().toISOString().split("T")[0]
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]

      const revenueResult = await getRevenueReport(startDate, endDate)
      if ((revenueResult as any).error) {
        console.error("Failed to load revenue data:", (revenueResult as any).error)
      } else {
        setRevenueData((revenueResult as any).data || [])
      }

      // Load real team members data from backend
      const teamResultUnknown = await getTeamMembers()
      const teamResult = teamResultUnknown as { error?: string; data?: any[] }
      if (teamResult.error) {
        console.error("Failed to load team members:", teamResult.error)
      } else {
        const teamData = teamResult.data || []
        setTeamMembers(teamData.map((member: any) => ({
          id: member.id,
          name: member.name || "Unknown",
          role: member.role || "Member",
          performance: member.performance || 0,
          tasks: member.tasks_assigned || 0,
        })))
      }
    } catch (err: any) {
      console.error("Error loading analytics data:", err)
      setError("Failed to load analytics data")
      toast({
        title: "Error loading analytics data",
        description: err.message || "Unknown error",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportPDF = () => {
    console.log("Exporting analytics to PDF...")
    // PDF export logic will be implemented
    toast({
      title: "Export started",
      description: "PDF export functionality will be implemented soon.",
    })
  }

  // Transform key metrics into stats format
  const stats = keyMetrics ? [
    {
      label: "Total Tasks",
      value: keyMetrics.totalTasks?.toString() || "0",
      change: "+5.2%",
      icon: BarChart3
    },
    {
      label: "Completed Tasks",
      value: keyMetrics.completedTasks?.toString() || "0",
      change: `${keyMetrics.completionRate || 0}%`,
      icon: TrendingUp
    },
    {
      label: "Team Members",
      value: keyMetrics.totalMembers?.toString() || "0",
      change: "+2",
      icon: Users
    },
    {
      label: "Completion Rate",
      value: `${keyMetrics.completionRate || 0}%`,
      change: "+3.1%",
      icon: Activity
    },
  ] : []

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 space-y-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading analytics data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 lg:p-8 space-y-8">
        <div className="text-center py-12">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={loadAnalyticsData} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    )
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
        {stats.map((stat: any) => {
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
      <RevenueChart expanded data={revenueData} />

      {/* Analytics Charts */}
      <AnalyticsCharts expanded />

      {/* Performance Metrics */}
      <PerformanceMetrics teamMembers={teamMembers} />
    </div>
  )
}
