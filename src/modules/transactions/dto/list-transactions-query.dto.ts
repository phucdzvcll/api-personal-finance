import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsDateString, IsInt, Min } from "class-validator";
import { Type } from "class-transformer";
import { TransactionType } from "../entities/transaction.entity";

export class ListTransactionsQueryDto {
  @ApiProperty({
    description: "Filter by transaction type",
    enum: TransactionType,
    required: false,
  })
  @IsOptional()
  @IsEnum(TransactionType)
  type?: TransactionType;

  @ApiProperty({
    description: "Filter by category ID",
    example: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  categoryId?: number;

  @ApiProperty({
    description: "Start date for filtering (YYYY-MM-DD format)",
    example: "2024-01-01",
    required: false,
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    description: "End date for filtering (YYYY-MM-DD format)",
    example: "2024-01-31",
    required: false,
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
