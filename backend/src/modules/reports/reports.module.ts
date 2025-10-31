import { Module } from "@nestjs/common"
import { ReportsService } from "./reports.service"
import { ReportsController } from "./reports.controller"
import { PdfService } from "./pdf.service"
import { SupabaseModule } from "../supabase/supabase.module"

@Module({
  imports: [SupabaseModule],
  providers: [ReportsService, PdfService],
  controllers: [ReportsController],
})
export class ReportsModule {}
