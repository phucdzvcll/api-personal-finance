import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsEnum, IsInt, IsDateString, IsOptional, IsString, Min } from "class-validator";
import { TransactionType } from "../entities/transaction.entity";

export class UpdateTransactionDto {
  @ApiProperty({
    description: "Transaction amount (must be greater than 0)",
    example: 150.75,
    minimum: 0.01,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  amount?: number;

  @ApiProperty({
    description: "Transaction type",
    enum: TransactionType,
    example: TransactionType.EXPENSE,
    required: false,
  })
  @IsOptional()
  @IsEnum(TransactionType)
  type?: TransactionType;

  @ApiProperty({
    description: "Category ID",
    example: 2,
    required: false,
  })
  @IsOptional()
  @IsInt()
  categoryId?: number;

  @ApiProperty({
    description: "Transaction date (YYYY-MM-DD format, cannot be in the future)",
    example: "2024-01-16",
    required: false,
  })
  @IsOptional()
  @IsDateString()
  transactionDate?: string;

  @ApiProperty({
    description: "Optional note",
    example: "Updated note",
    required: false,
  })
  @IsOptional()
  @IsString()
  note?: string;
}
