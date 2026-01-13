import { ApiProperty } from "@nestjs/swagger";
import { CategoryType } from "../entities/category.entity";

export class CategoryResponseDto {
  @ApiProperty({ description: "Category ID", example: 1 })
  id: number;

  @ApiProperty({ description: "Category name", example: "Food" })
  name: string;

  @ApiProperty({
    description: "Category type",
    enum: CategoryType,
    example: CategoryType.EXPENSE,
  })
  type: CategoryType;

  @ApiProperty({ description: "Icon identifier", example: "food", nullable: true })
  icon: string | null;

  @ApiProperty({ description: "Display color", example: "#FF5733", nullable: true })
  color: string | null;

  @ApiProperty({ description: "Category creation date" })
  createdAt: Date;

  @ApiProperty({ description: "Category last update date" })
  updatedAt: Date;
}
