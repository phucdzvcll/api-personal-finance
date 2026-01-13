import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CategoriesService } from "./categories.service";
import { CategoriesController } from "./categories.controller";
import { CategoryRepository } from "./repositories/category.repository";
import { CategoryEntity } from "./entities/category.entity";

@Module({
  imports: [TypeOrmModule.forFeature([CategoryEntity])],
  controllers: [CategoriesController],
  providers: [CategoriesService, CategoryRepository],
  exports: [CategoriesService],
})
export class CategoriesModule {}
