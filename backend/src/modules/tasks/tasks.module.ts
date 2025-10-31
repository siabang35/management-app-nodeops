import { Module } from "@nestjs/common"
import { TasksService } from "./tasks.service"
import { TasksController } from "./tasks.controller"
import { SupabaseModule } from "../supabase/supabase.module"

@Module({
  imports: [SupabaseModule],
  providers: [TasksService],
  controllers: [TasksController],
})
export class TasksModule {}
