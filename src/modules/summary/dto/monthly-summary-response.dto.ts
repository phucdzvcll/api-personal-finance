import { ApiProperty } from "@nestjs/swagger";
import { ExpenseByCategoryDto } from "./expense-by-category.dto";

export class MonthlySummaryResponseDto {
  @ApiProperty({
    description: "Year of the summary",
    example: 2026,
  })
  year: number;

  @ApiProperty({
    description: "Month of the summary (1-12)",
    example: 1,
  })
  month: number;

  @ApiProperty({
    description: "Total income for the month",
    example: 15000000,
  })
  totalIncome: number;

  @ApiProperty({
    description: "Total expense for the month",
    example: 8200000,
  })
  totalExpense: number;

  @ApiProperty({
    description: "Net balance (income - expense)",
    example: 6800000,
  })
  balance: number;

  @ApiProperty({
    description: "Expense breakdown by category",
    type: [ExpenseByCategoryDto],
  })
  expenseByCategory: ExpenseByCategoryDto[];
}
