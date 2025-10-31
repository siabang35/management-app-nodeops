"use client"

import { Download, Trash2, Eye, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { getRelativeTime } from "@/lib/utils"

interface Report {
  id: string
  name: string
  type: string
  generatedAt: string
  size: string
}

interface ReportListProps {
  reports: Report[]
  onDownload?: (reportId: string) => void
  onDelete?: (reportId: string) => void
  onView?: (reportId: string) => void
}

export function ReportList({ reports, onDownload, onDelete, onView }: ReportListProps) {
  const getReportIcon = (type: string) => {
    switch (type) {
      case "revenue":
        return "💰"
      case "tasks":
        return "✓"
      case "team":
        return "👥"
      case "comprehensive":
        return "📊"
      default:
        return "📄"
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Generated Reports</h3>
      <div className="space-y-3">
        {reports.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No reports generated yet. Create your first report above.</p>
          </Card>
        ) : (
          reports.map((report) => (
            <Card key={report.id} className="p-4 hover:border-primary/50 transition-colors">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1">
                  <div className="text-2xl">{getReportIcon(report.type)}</div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-foreground truncate">{report.name}</h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <span className="capitalize">{report.type}</span>
                      <span>•</span>
                      <span>{getRelativeTime(report.generatedAt)}</span>
                      <span>•</span>
                      <span>{report.size}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onView?.(report.id)}>
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onDownload?.(report.id)}>
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Share2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => onDelete?.(report.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
