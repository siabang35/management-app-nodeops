import { Module } from "@nestjs/common"
import { MindshareController } from "./mindshare.controller"
import { MindshareService } from "./mindshare.service"
import { SupabaseModule } from "../supabase/supabase.module"

@Module({
  imports: [SupabaseModule],
  controllers: [MindshareController],
  providers: [MindshareService],
  exports: [MindshareService],
})
export class MindshareModule {}
