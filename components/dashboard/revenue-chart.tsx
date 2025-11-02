"use client"

import { useState, useEffect } from "react"
import { BarChart3, TrendingUp, Loader2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { getRevenueReport } from "@/app/actions/reports"
import { useToast } from "@/hooks/use-toast"

interface RevenueChartProps {
  expanded?: boolean
  data?: any[]
}

export function RevenueChart({ expanded = false, data: propData }: RevenueChartProps) {
  const [revenueData, setRevenueData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  // Load revenue data on component mount if not provided via props
  useEffect(() => {
    if (!propData) {
      loadRevenueData()
    } else {
      setRevenueData(propData)
      setIsLoading(false)
    }
  }, [propData])

  const loadRevenueData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Load revenue data for the last 6 months
      const endDate = new Date().toISOString().split("T")[0]
      const startDate = new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]

      const result = await getRevenueReport(startDate, endDate)
      // Narrow the type of result
      if ((result as { error?: string }).error) {
        const errorMsg = (result as { error: string }).error
        console.error("Failed to load revenue data:", errorMsg)
        setError("Failed to load revenue data")
        toast({
          title: "Error loading revenue data",
          description: errorMsg,
          variant: "destructive",
        })
      } else {
        setRevenueData((result as { data?: any[] }).data || [])
      }
    } catch (err: any) {
      console.error("Error loading revenue data:", err)
      setError("Failed to load revenue data")
      toast({
        title: "Error loading revenue data",
        description: err.message || "Unknown error",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Transform revenue data into chart format
  const chartData = revenueData.length > 0 ? revenueData.slice(-6).map((item) => {
    const date = new Date(item.date || item.created_at)
    const month = date.toLocaleDateString('en-US', { month: 'short' })
    return {
      month,
      value: item.amount || item.value || Math.floor(Math.random() * 50) + 50 // Fallback for demo
    }
  }) : [
    { month: "Jan", value: 65 },
    { month: "Feb", value: 78 },
    { month: "Mar", value: 82 },
    { month: "Apr", value: 71 },
    { month: "May", value: 88 },
    { month: "Jun", value: 95 },
  ]

  const maxValue = Math.max(...chartData.map((d) => d.value))
  const totalRevenue = chartData.reduce((sum, item) => sum + item.value, 0)
  const growthRate = chartData.length > 1 ?
    ((chartData[chartData.length - 1].value - chartData[0].value) / chartData[0].value * 100).toFixed(1) : "0.0"

  if (isLoading) {
    return (
      <Card className="p-6 glass-effect hover:glass-effect-dark transition-all duration-300 group flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="p-6 glass-effect hover:glass-effect-dark transition-all duration-300 group">
        <div className="text-center py-12">
          <p className="text-destructive mb-4">{error}</p>
          <button
            onClick={loadRevenueData}
            className="text-sm text-primary hover:underline"
          >
            Try Again
          </button>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6 glass-effect hover:glass-effect-dark transition-all duration-300 group">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/50">
        <div className="animate-slide-in-left">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 group-hover:animate-glow-pulse">
              <BarChart3 className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Revenue Overview</h3>
          </div>
          <p className="mt-1 text-sm text-muted-foreground flex items-center gap-1">
            <TrendingUp className="w-4 h-4 text-accent" />
            Monthly revenue trends for 2024
          </p>
        </div>
      </div>

      <div className="flex items-end justify-between gap-4" style={{ height: expanded ? "400px" : "200px" }}>
        {chartData.map((item, index) => (
          <div
            key={item.month}
            className="flex flex-1 flex-col items-center gap-3 group/bar"
            style={{
              animationDelay: `${index * 50}ms`,
            }}
          >
            <div className="relative w-full h-full flex items-end justify-center">
              <div className="absolute inset-0 rounded-t-lg bg-gradient-to-t from-primary/20 to-transparent opacity-0 group-hover/bar:opacity-100 transition-opacity duration-300" />
              <div
                className="w-full rounded-t-lg bg-gradient-to-t from-primary to-cyan-500 transition-all duration-500 hover:shadow-lg hover:shadow-primary/50 group-hover/bar:animate-glow-pulse relative"
                style={{
                  height: `${(item.value / maxValue) * (expanded ? 360 : 160)}px`,
                }}
              >
                <div className="absolute inset-0 rounded-t-lg bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer opacity-0 group-hover/bar:opacity-100" />
              </div>
            </div>
            <div className="text-xs font-medium text-muted-foreground group-hover/bar:text-foreground transition-colors duration-300">
              {item.month}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-gradient-to-r from-transparent via-border to-transparent pt-6">
        <div className="animate-slide-in-left">
          <div className="text-sm text-muted-foreground">Total Revenue</div>
          <div className="mt-1 font-mono text-2xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">
            ${totalRevenue.toLocaleString()}
          </div>
        </div>
        <div className="h-12 w-px bg-gradient-to-b from-transparent via-border to-transparent" />
        <div className="animate-slide-in-right text-right">
          <div className="text-sm text-muted-foreground">Growth Rate</div>
          <div className="mt-1 font-mono text-2xl font-bold text-accent flex items-center gap-1 justify-end">
            <TrendingUp className="w-5 h-5" />
            +{growthRate}%
          </div>
        </div>
      </div>
    </Card>
  )
}
