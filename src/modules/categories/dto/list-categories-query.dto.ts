import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsOptional } from "class-validator";
import { CategoryType } from "../entities/category.entity";

export class ListCategoriesQueryDto {
  @ApiProperty({
    description: "Filter by category type",
    enum: CategoryType,
    required: false,
  })
  @IsOptional()
  @IsEnum(CategoryType)
  type?: CategoryType;
}
