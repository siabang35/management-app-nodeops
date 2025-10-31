"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { RevenueChart } from "@/components/dashboard/revenue-chart"
import { ReportGenerator } from "@/components/dashboard/report-generator"
import { ReportList } from "@/components/dashboard/report-list"

export function ReportsView() {
  const [reportType, setReportType] = useState("revenue")
  const [generatedReports, setGeneratedReports] = useState([
    {
      id: "1",
      name: "Q1 Revenue Report",
      type: "revenue",
      generatedAt: new Date(Date.now() - 86400000).toISOString(),
      size: "2.4 MB",
    },
    {
      id: "2",
      name: "Team Performance Analysis",
      type: "team",
      generatedAt: new Date(Date.now() - 172800000).toISOString(),
      size: "1.8 MB",
    },
    {
      id: "3",
      name: "Task Completion Report",
      type: "tasks",
      generatedAt: new Date(Date.now() - 259200000).toISOString(),
      size: "1.2 MB",
    },
  ])

  const handleGenerateReport = (report: any) => {
    const newReport = {
      id: Date.now().toString(),
      name: report.name,
      type: report.type,
      generatedAt: new Date().toISOString(),
      size: `${Math.random() * 3 + 1}.${Math.floor(Math.random() * 9)} MB`,
    }
    setGeneratedReports([newReport, ...generatedReports])
    console.log("Report generated:", newReport)
  }

  const handleDownloadReport = (reportId: string) => {
    console.log("Downloading report:", reportId)
    // PDF download logic will be implemented
  }

  const handleDeleteReport = (reportId: string) => {
    setGeneratedReports(generatedReports.filter((r) => r.id !== reportId))
  }

  const handleViewReport = (reportId: string) => {
    console.log("Viewing report:", reportId)
    // Report preview logic will be implemented
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
            reports={generatedReports}
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
