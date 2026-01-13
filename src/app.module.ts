import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigService } from "@nestjs/config";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigModule as AppConfigModule } from "./config/config.module";
import { AuthModule } from "./modules/auth/auth.module";
import { UsersModule } from "./modules/users/users.module";
import { CategoriesModule } from "./modules/categories/categories.module";
import { TransactionsModule } from "./modules/transactions/transactions.module";

@Module({
  imports: [
    AppConfigModule,
    TypeOrmModule.forRootAsync({
      imports: [AppConfigModule],
      useFactory: (configService: ConfigService) => {
        const nodeEnv: string = configService.get<string>("nodeEnv") || "development";
        return {
          type: "postgres",
          host: configService.get<string>("database.host"),
          port: configService.get<number>("database.port"),
          username: configService.get<string>("database.username"),
          password: configService.get<string>("database.password"),
          database: configService.get<string>("database.database"),
          entities: [__dirname + "/**/*.entity{.ts,.js}"],
          synchronize: nodeEnv !== "production", // Auto-create tables in dev only
          logging: nodeEnv === "development",
        };
      },
      inject: [ConfigService],
    }),
    UsersModule,
    AuthModule,
    CategoriesModule,
    TransactionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
