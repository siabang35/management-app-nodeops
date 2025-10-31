import { Injectable } from "@nestjs/common"
import * as PDFDocument from "pdfkit"
import type { Readable } from "stream"

@Injectable()
export class PdfService {
  generateRevenueReportPDF(reportData: any): Readable {
    const doc = new PDFDocument({
      size: "A4",
      margin: 50,
    })

    // Header
    doc.fontSize(24).font("Helvetica-Bold").text("Revenue Report", { align: "center" })
    doc.moveDown(0.5)
    doc.fontSize(10).font("Helvetica").text(`Generated: ${new Date().toLocaleDateString()}`, {
      align: "center",
    })
    doc.moveDown(1)

    // Summary Section
    doc.fontSize(14).font("Helvetica-Bold").text("Summary")
    doc.fontSize(10).font("Helvetica")
    doc.text(`Period: ${reportData.period.startDate} to ${reportData.period.endDate}`)
    doc.text(`Total Revenue: $${reportData.total.toFixed(2)}`)
    doc.text(`Average Revenue: $${reportData.average.toFixed(2)}`)
    doc.text(`Number of Transactions: ${reportData.count}`)
    doc.moveDown(1)

    // Detailed Data Table
    doc.fontSize(12).font("Helvetica-Bold").text("Detailed Transactions")
    doc.moveDown(0.5)

    const tableTop = doc.y
    const col1 = 50
    const col2 = 200
    const col3 = 350
    const col4 = 450

    // Table Header
    doc.fontSize(10).font("Helvetica-Bold")
    doc.text("Date", col1, tableTop)
    doc.text("Description", col2, tableTop)
    doc.text("Amount", col3, tableTop)
    doc.text("Status", col4, tableTop)

    // Table Rows
    doc.fontSize(9).font("Helvetica")
    let yPosition = tableTop + 20

    reportData.data.forEach((item: any) => {
      if (yPosition > 700) {
        doc.addPage()
        yPosition = 50
      }

      doc.text(new Date(item.date).toLocaleDateString(), col1, yPosition)
      doc.text(item.description || "N/A", col2, yPosition)
      doc.text(`$${item.amount.toFixed(2)}`, col3, yPosition)
      doc.text(item.status || "Completed", col4, yPosition)

      yPosition += 20
    })

    doc.end()
    return doc
  }

  generateTaskReportPDF(reportData: any): Readable {
    const doc = new PDFDocument({
      size: "A4",
      margin: 50,
    })

    // Header
    doc.fontSize(24).font("Helvetica-Bold").text("Task Report", { align: "center" })
    doc.moveDown(0.5)
    doc.fontSize(10).font("Helvetica").text(`Generated: ${new Date().toLocaleDateString()}`, {
      align: "center",
    })
    doc.moveDown(1)

    // Summary Section
    doc.fontSize(14).font("Helvetica-Bold").text("Summary")
    doc.fontSize(10).font("Helvetica")
    doc.text(`Period: ${reportData.period.startDate} to ${reportData.period.endDate}`)
    doc.text(`Total Tasks: ${reportData.total}`)
    doc.text(`Completed: ${reportData.completed}`)
    doc.text(`In Progress: ${reportData.inProgress}`)
    doc.text(`Pending: ${reportData.pending}`)
    doc.text(`Completion Rate: ${reportData.completionRate.toFixed(2)}%`)
    doc.moveDown(1)

    // Statistics
    doc.fontSize(12).font("Helvetica-Bold").text("Task Statistics")
    doc.moveDown(0.5)

    const stats = [
      { label: "Total Tasks", value: reportData.total },
      { label: "Completed", value: reportData.completed },
      { label: "In Progress", value: reportData.inProgress },
      { label: "Pending", value: reportData.pending },
    ]

    stats.forEach((stat) => {
      doc.fontSize(10).font("Helvetica").text(`${stat.label}: ${stat.value}`)
    })

    doc.end()
    return doc
  }

  generateTeamReportPDF(reportData: any): Readable {
    const doc = new PDFDocument({
      size: "A4",
      margin: 50,
    })

    // Header
    doc.fontSize(24).font("Helvetica-Bold").text("Team Report", { align: "center" })
    doc.moveDown(0.5)
    doc.fontSize(10).font("Helvetica").text(`Generated: ${new Date().toLocaleDateString()}`, {
      align: "center",
    })
    doc.moveDown(1)

    // Summary Section
    doc.fontSize(14).font("Helvetica-Bold").text("Team Summary")
    doc.fontSize(10).font("Helvetica")
    doc.text(`Total Members: ${reportData.totalMembers}`)
    doc.moveDown(1)

    // Member Details
    doc.fontSize(12).font("Helvetica-Bold").text("Member Performance")
    doc.moveDown(0.5)

    const tableTop = doc.y
    const col1 = 50
    const col2 = 200
    const col3 = 350
    const col4 = 450

    // Table Header
    doc.fontSize(10).font("Helvetica-Bold")
    doc.text("Name", col1, tableTop)
    doc.text("Role", col2, tableTop)
    doc.text("Tasks Assigned", col3, tableTop)
    doc.text("Completed", col4, tableTop)

    // Table Rows
    doc.fontSize(9).font("Helvetica")
    let yPosition = tableTop + 20

    reportData.memberStats.forEach((member: any) => {
      if (yPosition > 700) {
        doc.addPage()
        yPosition = 50
      }

      doc.text(member.name, col1, yPosition)
      doc.text(member.role, col2, yPosition)
      doc.text(member.tasksAssigned.toString(), col3, yPosition)
      doc.text(member.tasksCompleted.toString(), col4, yPosition)

      yPosition += 20
    })

    doc.end()
    return doc
  }
}
