import { Module } from "@nestjs/common"
import { TeamsService } from "./teams.service"
import { TeamsController } from "./teams.controller"
import { SupabaseModule } from "../supabase/supabase.module"

@Module({
  imports: [SupabaseModule],
  providers: [TeamsService],
  controllers: [TeamsController],
})
export class TeamsModule {}
