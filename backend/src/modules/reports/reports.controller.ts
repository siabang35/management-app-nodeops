import { Controller, Get, Res } from "@nestjs/common"
import type { Response } from "express"
import type { ReportsService } from "./reports.service"
import type { PdfService } from "./pdf.service"

@Controller("reports")
export class ReportsController {
  constructor(
    private reportsService: ReportsService,
    private pdfService: PdfService,
  ) {}

  @Get("revenue")
  async getRevenueReport(startDate: string, endDate: string) {
    return this.reportsService.generateRevenueReport(new Date(startDate), new Date(endDate))
  }

  @Get("revenue/pdf")
  async getRevenueReportPDF(startDate: string, endDate: string, @Res() res: Response) {
    const reportData = await this.reportsService.generateRevenueReport(new Date(startDate), new Date(endDate))
    const pdfStream = this.pdfService.generateRevenueReportPDF(reportData)

    res.setHeader("Content-Type", "application/pdf")
    res.setHeader("Content-Disposition", "attachment; filename=revenue-report.pdf")

    pdfStream.pipe(res)
  }

  @Get("tasks")
  async getTaskReport(startDate: string, endDate: string) {
    return this.reportsService.generateTaskReport(new Date(startDate), new Date(endDate))
  }

  @Get("tasks/pdf")
  async getTaskReportPDF(startDate: string, endDate: string, @Res() res: Response) {
    const reportData = await this.reportsService.generateTaskReport(new Date(startDate), new Date(endDate))
    const pdfStream = this.pdfService.generateTaskReportPDF(reportData)

    res.setHeader("Content-Type", "application/pdf")
    res.setHeader("Content-Disposition", "attachment; filename=task-report.pdf")

    pdfStream.pipe(res)
  }

  @Get("team")
  async getTeamReport(startDate: string, endDate: string) {
    return this.reportsService.generateTeamReport(new Date(startDate), new Date(endDate))
  }

  @Get("team/pdf")
  async getTeamReportPDF(startDate: string, endDate: string, @Res() res: Response) {
    const reportData = await this.reportsService.generateTeamReport(new Date(startDate), new Date(endDate))
    const pdfStream = this.pdfService.generateTeamReportPDF(reportData)

    res.setHeader("Content-Type", "application/pdf")
    res.setHeader("Content-Disposition", "attachment; filename=team-report.pdf")

    pdfStream.pipe(res)
  }

  @Get("metrics")
  async getMetrics() {
    return this.reportsService.getMetrics()
  }
}
