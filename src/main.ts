import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";
import { ConfigService } from "@nestjs/config";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService: ConfigService = app.get<ConfigService>(ConfigService);

  // Get configuration
  const port = (configService.get("port") as number) || 3000;
  const apiPrefix = (configService.get("api.prefix") as string) || "api/v1";
  const nodeEnv = (configService.get("nodeEnv") as string) || "development";

  // Set global API prefix
  app.setGlobalPrefix(apiPrefix);

  // Enable validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  // Swagger/OpenAPI configuration
  const swaggerEnabled: boolean = configService.get<boolean>("swagger.enabled") ?? nodeEnv !== "production";
  if (swaggerEnabled) {
    const swaggerPath = (configService.get("swagger.path") as string) || "docs";
    const config = new DocumentBuilder()
      .setTitle("Personal Finance Management API")
      .setDescription("API documentation for Personal Finance Management System")
      .setVersion("1.0")
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
      .addTag("health", "Health check endpoints")
      .addTag("auth", "Authentication endpoints")
      .addTag("users", "User management endpoints")
      .addTag("transactions", "Transaction management endpoints")
      .addTag("categories", "Category management endpoints")
      .addTag("debts", "Debt management endpoints")
      .addTag("credit-cards", "Credit card management endpoints")
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(`${apiPrefix}/${swaggerPath}`, app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });
    console.log(`Swagger documentation: http://localhost:${port}/${apiPrefix}/${swaggerPath}`);
  }

  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}/${apiPrefix}`);
}
bootstrap();
