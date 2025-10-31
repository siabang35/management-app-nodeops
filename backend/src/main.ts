import { NestFactory } from "@nestjs/core"
import { ValidationPipe } from "@nestjs/common"
import { AppModule } from "./app.module"

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // Enable CORS for frontend
  app.enableCors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })

  // Global validation pipe
  const port = process.env.PORT || 3001
  app.useGlobalPipes(new ValidationPipe({ transform: true }))

  await app.listen(port)
  console.log(`Application is running on: http://localhost:${port}`)
}

bootstrap()
