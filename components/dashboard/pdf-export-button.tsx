"use client"

import { useState } from "react"
import { Download, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useApi } from "@/hooks/use-api"

interface PdfExportButtonProps {
  reportType: "revenue" | "tasks" | "team"
  startDate?: string
  endDate?: string
}

export function PdfExportButton({ reportType, startDate, endDate }: PdfExportButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { downloadReportPDF } = useApi()

  const handleExport = async () => {
    if (!startDate || !endDate) {
      alert("Please select date range")
      return
    }

    setIsLoading(true)
    try {
      await downloadReportPDF(reportType, startDate, endDate)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button onClick={handleExport} disabled={isLoading} className="gap-2">
      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
      {isLoading ? "Generating..." : "Export PDF"}
    </Button>
  )
}
