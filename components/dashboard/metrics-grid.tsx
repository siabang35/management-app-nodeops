"use client"

import { useState, useEffect } from "react"
import { TrendingUp, TrendingDown, Users, CheckCircle2, Activity, Loader2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { getKeyMetrics } from "@/app/actions/reports"
import { useToast } from "@/hooks/use-toast"

export function MetricsGrid() {
  const [keyMetrics, setKeyMetrics] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  // Load key metrics on component mount
  useEffect(() => {
    loadKeyMetrics()
  }, [])

  const loadKeyMetrics = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const result = await getKeyMetrics()
      if (typeof result === "object" && result !== null && "error" in result) {
        if (result.error) {
          console.error("Failed to load key metrics:", result.error)
          setError("Failed to load metrics")
          toast({
            title: "Error loading metrics",
            description: result.error,
            variant: "destructive",
          })
        } else {
          setKeyMetrics((result as any).data)
        }
      } else {
        setError("Unexpected response format")
        toast({
          title: "Error loading metrics",
          description: "Unexpected response format",
          variant: "destructive",
        })
      }
    } catch (err: any) {
      console.error("Error loading key metrics:", err)
      setError("Failed to load metrics")
      toast({
        title: "Error loading metrics",
        description: err.message || "Unknown error",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Transform key metrics into display format
  const metrics = keyMetrics ? [
    {
      label: "Total Tasks",
      value: keyMetrics.totalTasks?.toString() || "0",
      change: "+5.2%",
      trend: "up" as const,
      icon: CheckCircle2,
      gradient: "from-blue-500/20 to-cyan-500/20",
      borderColor: "border-blue-500/30",
    },
    {
      label: "Completed Tasks",
      value: keyMetrics.completedTasks?.toString() || "0",
      change: `${keyMetrics.completionRate || 0}%`,
      trend: "up" as const,
      icon: TrendingUp,
      gradient: "from-emerald-500/20 to-teal-500/20",
      borderColor: "border-emerald-500/30",
    },
    {
      label: "Team Members",
      value: keyMetrics.totalMembers?.toString() || "0",
      change: "+2",
      trend: "up" as const,
      icon: Users,
      gradient: "from-purple-500/20 to-pink-500/20",
      borderColor: "border-purple-500/30",
    },
    {
      label: "Completion Rate",
      value: `${keyMetrics.completionRate || 0}%`,
      change: "+3.1%",
      trend: "up" as const,
      icon: Activity,
      gradient: "from-orange-500/20 to-red-500/20",
      borderColor: "border-orange-500/30",
    },
  ] : []

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, index) => (
          <Card key={index} className="p-6 flex items-center justify-center min-h-[140px]">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, index) => (
          <Card key={index} className="p-6 flex items-center justify-center min-h-[140px]">
            <div className="text-center">
              <p className="text-destructive text-sm mb-2">Failed to load</p>
              <button
                onClick={loadKeyMetrics}
                className="text-xs text-primary hover:underline"
              >
                Retry
              </button>
            </div>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric, index) => {
        const Icon = metric.icon
        const TrendIcon = metric.trend === "up" ? TrendingUp : TrendingDown

        return (
          <Card
            key={metric.label}
            className={`p-6 relative overflow-hidden group hover-lift transition-all duration-300 ${metric.borderColor} border-2`}
            style={{
              animationDelay: `${index * 100}ms`,
            }}
          >
            <div
              className={`absolute inset-0 bg-gradient-to-br ${metric.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 animate-shimmer" />

            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`w-10 h-10 rounded-lg bg-gradient-to-br ${metric.gradient} flex items-center justify-center group-hover:animate-glow-pulse transition-all duration-300`}
                >
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div
                  className={`flex items-center gap-1 text-sm font-medium transition-all duration-300 ${
                    metric.trend === "up" ? "text-accent group-hover:text-accent/80" : "text-destructive"
                  }`}
                >
                  <TrendIcon className="w-4 h-4 animate-bounce-smooth" />
                  {metric.change}
                </div>
              </div>

              <div>
                <div className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                  {metric.value}
                </div>
                <div className="mt-1 text-sm text-muted-foreground group-hover:text-foreground/70 transition-colors duration-300">
                  {metric.label}
                </div>
              </div>

              <div className="mt-4 h-1 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-accent rounded-full animate-gradient-shift"
                  style={{
                    width: `${Math.min(100, Math.max(20, (parseInt(metric.value.replace('%', '')) || 50)))}%`,
                  }}
                />
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
