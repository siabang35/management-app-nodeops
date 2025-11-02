import { NestFactory } from "@nestjs/core"
import { ValidationPipe } from "@nestjs/common"
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger"
import { AppModule } from "./app.module"

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // Set global API prefix
  app.setGlobalPrefix("api")

  // Enable CORS for frontend
  app.enableCors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({ transform: true }))

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle("NodeOps Management API")
    .setDescription("Web3 Task Management Backend API")
    .setVersion("1.0")
    .addTag("auth", "Authentication endpoints")
    .addTag("tasks", "Task management endpoints")
    .addTag("teams", "Team management endpoints")
    .addTag("reports", "Reporting endpoints")
    .addTag("mindshare", "Mindshare management endpoints")
    .addBearerAuth(
      {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        name: "JWT",
        description: "Enter JWT token",
        in: "header",
      },
      "JWT-auth"
    )
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup("api", app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: "alpha",
      operationsSorter: "alpha",
    },
  })

  const port = process.env.PORT || 3001
  await app.listen(port)
  console.log(`Application is running on: http://localhost:${port}`)
  console.log(`Swagger documentation available at: http://localhost:${port}/api`)
}

bootstrap()
