import { ApiProperty } from "@nestjs/swagger";

export class ExpenseByCategoryDto {
  @ApiProperty({
    description: "Category ID",
    example: 1,
  })
  categoryId: number;

  @ApiProperty({
    description: "Category name",
    example: "Food",
  })
  categoryName: string;

  @ApiProperty({
    description: "Total amount spent in this category",
    example: 3200000,
  })
  totalAmount: number;

  @ApiProperty({
    description: "Percentage of total expense",
    example: 39,
    minimum: 0,
    maximum: 100,
  })
  percentage: number;

  @ApiProperty({
    description: "Category icon identifier",
    example: "food",
    nullable: true,
  })
  icon: string | null;

  @ApiProperty({
    description: "Category display color",
    example: "#FF5733",
    nullable: true,
  })
  color: string | null;
}
