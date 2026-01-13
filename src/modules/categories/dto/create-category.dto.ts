import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsEnum, IsOptional, MinLength, MaxLength } from "class-validator";
import { CategoryType } from "../entities/category.entity";

export class CreateCategoryDto {
  @ApiProperty({
    description: "Category name",
    example: "Food",
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: "Category type",
    enum: CategoryType,
    example: CategoryType.EXPENSE,
  })
  @IsEnum(CategoryType)
  type: CategoryType;

  @ApiProperty({
    description: "Icon identifier",
    example: "food",
    required: false,
  })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiProperty({
    description: "Display color",
    example: "#FF5733",
    required: false,
  })
  @IsOptional()
  @IsString()
  color?: string;
}
