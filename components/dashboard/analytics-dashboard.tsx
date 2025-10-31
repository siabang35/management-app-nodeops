"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { useApi } from "@/hooks/use-api"

export function AnalyticsDashboard() {
  const [metrics, setMetrics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { loading: apiLoading } = useApi()

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch("http://localhost:3001/reports/metrics")
        const data = await response.json()
        setMetrics(data)
      } catch (error) {
        console.error("Failed to fetch metrics:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()
  }, [])

  if (loading) {
    return <div className="text-center py-8">Loading analytics...</div>
  }

  if (!metrics) {
    return <div className="text-center py-8 text-muted-foreground">No data available</div>
  }

  const analyticsCards = [
    { label: "Total Tasks", value: metrics.totalTasks },
    { label: "Completed Tasks", value: metrics.completedTasks },
    { label: "Total Members", value: metrics.totalMembers },
    { label: "Active Members", value: metrics.activeMembers },
    { label: "Total Revenue", value: `$${metrics.totalRevenue.toFixed(2)}` },
    { label: "Average Revenue", value: `$${metrics.averageRevenue.toFixed(2)}` },
  ]

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {analyticsCards.map((card) => (
        <Card key={card.label} className="p-6">
          <div className="text-sm text-muted-foreground mb-2">{card.label}</div>
          <div className="text-3xl font-bold text-foreground">{card.value}</div>
        </Card>
      ))}
    </div>
  )
}
