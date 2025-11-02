"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { RevenueChart } from "@/components/dashboard/revenue-chart"
import { ReportGenerator } from "@/components/dashboard/report-generator"
import { ReportList } from "@/components/dashboard/report-list"
import { getReports } from "@/app/actions/reports"
import { useToast } from "@/hooks/use-toast"

export function ReportsView() {
  const [reportType, setReportType] = useState("revenue")
  const [reports, setReports] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  // Load reports on component mount
  useEffect(() => {
    loadReports()
  }, [])

  const loadReports = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const result = await getReports()
      if (typeof result === "object" && result !== null && "error" in result) {
        // Now TypeScript knows result has an error property
        console.error("Failed to load reports:", (result as any).error)
        setError("Failed to load reports")
        toast({
          title: "Error loading reports",
          description: (result as any).error,
          variant: "destructive",
        })
      } else if (typeof result === "object" && result !== null && "data" in result) {
        setReports((result as any).data || [])
      }
    } catch (err: any) {
      console.error("Error loading reports:", err)
      setError("Failed to load reports")
      toast({
        title: "Error loading reports",
        description: err.message || "Unknown error",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }


  const handleDownloadReport = async (_reportId: string) => {
    try {
      // In a real implementation, this would call a download action
      toast({
        title: "Download started",
        description: "Report download will be implemented soon.",
      })
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Failed to download the report.",
        variant: "destructive",
      })
    }
  }
  // Remove mockup data generation in handleGenerateReport
  const handleGenerateReport = async (report: any) => {
    try {
      setIsLoading(true)
      setError(null)
      // Call a real generate report action here, e.g. generateReport(report)
      // For now, just reload reports after supposed generation
      // await generateReport(report) // Uncomment and implement this when available
      await loadReports()
      toast({
        title: "Report generated",
        description: `${report.name} has been generated successfully.`,
      })
    } catch (error: any) {
      setError("Failed to generate report")
      toast({
        title: "Generation failed",
        description: error?.message || "Failed to generate the report.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }
  const handleDeleteReport = (reportId: string) => {
    setReports(reports.filter((r) => r.id !== reportId))
    toast({
      title: "Report deleted",
      description: "Report has been removed successfully.",
    })
  }

  const handleViewReport = (reportId: string) => {
    console.log("Viewing report:", reportId)
    // Report preview logic will be implemented
    toast({
      title: "View report",
      description: "Report preview will be implemented soon.",
    })
  }

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 space-y-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading reports...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 lg:p-8 space-y-8">
        <div className="text-center py-12">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={loadReports} variant="outline">
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
          <h1 className="text-3xl font-bold text-foreground">Reports & Analytics</h1>
          <p className="mt-2 text-muted-foreground">Generate and download detailed reports</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex gap-2 flex-wrap">
            {["revenue", "performance", "tasks", "team"].map((type) => (
              <Button
                key={type}
                variant={reportType === type ? "default" : "outline"}
                onClick={() => setReportType(type)}
                className="capitalize"
              >
                {type}
              </Button>
            ))}
          </div>

          <RevenueChart expanded />

          <ReportList
            reports={reports}
            onDownload={handleDownloadReport}
            onDelete={handleDeleteReport}
            onView={handleViewReport}
          />
        </div>

        <div>
          <ReportGenerator onGenerate={handleGenerateReport} />
        </div>
      </div>
    </div>
  )
}
