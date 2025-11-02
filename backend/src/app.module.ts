import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { TasksModule } from "./modules/tasks/tasks.module"
import { TeamsModule } from "./modules/teams/teams.module"
import { ReportsModule } from "./modules/reports/reports.module"
import { AuthModule } from "./modules/auth/auth.module"
import { SupabaseModule } from "./modules/supabase/supabase.module"
import { MindshareModule } from "./modules/mindshare/mindshare.module"

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    SupabaseModule,
    AuthModule,
    TasksModule,
    TeamsModule,
    ReportsModule,
    MindshareModule,
  ],
})
export class AppModule {}
