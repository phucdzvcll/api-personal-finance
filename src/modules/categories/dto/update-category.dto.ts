import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsOptional, MinLength, MaxLength } from "class-validator";

export class UpdateCategoryDto {
  @ApiProperty({
    description: "Category name",
    example: "Food & Dining",
    minLength: 1,
    maxLength: 100,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name?: string;

  @ApiProperty({
    description: "Icon identifier",
    example: "restaurant",
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
