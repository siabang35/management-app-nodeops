import { Controller, Get, Res, Query } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from "@nestjs/swagger"
import { Response } from "express"
import { ReportsService } from "./reports.service"
import { PdfService } from "./pdf.service"

@ApiTags("reports")
@Controller("reports")
export class ReportsController {
  constructor(
    private reportsService: ReportsService,
    private pdfService: PdfService,
  ) {}

  @Get("revenue")
  @ApiOperation({ summary: "Generate revenue report" })
  @ApiQuery({ name: "startDate", description: "Start date for the report" })
  @ApiQuery({ name: "endDate", description: "End date for the report" })
  @ApiResponse({ status: 200, description: "Revenue report generated successfully" })
  async getRevenueReport(@Query("startDate") startDate: string, @Query("endDate") endDate: string) {
    return this.reportsService.generateRevenueReport(new Date(startDate), new Date(endDate))
  }

  @Get("revenue/pdf")
  @ApiOperation({ summary: "Generate revenue report as PDF" })
  @ApiQuery({ name: "startDate", description: "Start date for the report" })
  @ApiQuery({ name: "endDate", description: "End date for the report" })
  @ApiResponse({ status: 200, description: "PDF report generated successfully" })
  async getRevenueReportPDF(@Query("startDate") startDate: string, @Query("endDate") endDate: string, @Res() res: Response) {
    const reportData = await this.reportsService.generateRevenueReport(new Date(startDate), new Date(endDate))
    const pdfStream = this.pdfService.generateRevenueReportPDF(reportData)

    res.setHeader("Content-Type", "application/pdf")
    res.setHeader("Content-Disposition", "attachment; filename=revenue-report.pdf")

    pdfStream.pipe(res)
  }

  @Get("tasks")
  @ApiOperation({ summary: "Generate task report" })
  @ApiQuery({ name: "startDate", description: "Start date for the report" })
  @ApiQuery({ name: "endDate", description: "End date for the report" })
  @ApiResponse({ status: 200, description: "Task report generated successfully" })
  async getTaskReport(@Query("startDate") startDate: string, @Query("endDate") endDate: string) {
    return this.reportsService.generateTaskReport(new Date(startDate), new Date(endDate))
  }

  @Get("tasks/pdf")
  @ApiOperation({ summary: "Generate task report as PDF" })
  @ApiQuery({ name: "startDate", description: "Start date for the report" })
  @ApiQuery({ name: "endDate", description: "End date for the report" })
  @ApiResponse({ status: 200, description: "PDF report generated successfully" })
  async getTaskReportPDF(@Query("startDate") startDate: string, @Query("endDate") endDate: string, @Res() res: Response) {
    const reportData = await this.reportsService.generateTaskReport(new Date(startDate), new Date(endDate))
    const pdfStream = this.pdfService.generateTaskReportPDF(reportData)

    res.setHeader("Content-Type", "application/pdf")
    res.setHeader("Content-Disposition", "attachment; filename=task-report.pdf")

    pdfStream.pipe(res)
  }

  @Get("team")
  @ApiOperation({ summary: "Generate team report" })
  @ApiQuery({ name: "startDate", description: "Start date for the report" })
  @ApiQuery({ name: "endDate", description: "End date for the report" })
  @ApiResponse({ status: 200, description: "Team report generated successfully" })
  async getTeamReport(@Query("startDate") startDate: string, @Query("endDate") endDate: string) {
    return this.reportsService.generateTeamReport(new Date(startDate), new Date(endDate))
  }

  @Get("team/pdf")
  @ApiOperation({ summary: "Generate team report as PDF" })
  @ApiQuery({ name: "startDate", description: "Start date for the report" })
  @ApiQuery({ name: "endDate", description: "End date for the report" })
  @ApiResponse({ status: 200, description: "PDF report generated successfully" })
  async getTeamReportPDF(@Query("startDate") startDate: string, @Query("endDate") endDate: string, @Res() res: Response) {
    const reportData = await this.reportsService.generateTeamReport(new Date(startDate), new Date(endDate))
    const pdfStream = this.pdfService.generateTeamReportPDF(reportData)

    res.setHeader("Content-Type", "application/pdf")
    res.setHeader("Content-Disposition", "attachment; filename=team-report.pdf")

    pdfStream.pipe(res)
  }

  @Get("metrics")
  @ApiOperation({ summary: "Get system metrics" })
  @ApiResponse({ status: 200, description: "Metrics retrieved successfully" })
  async getMetrics() {
    return this.reportsService.getMetrics()
  }
}
