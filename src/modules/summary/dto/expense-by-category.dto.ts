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
}
