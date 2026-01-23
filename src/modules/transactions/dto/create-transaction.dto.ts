import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsEnum, IsInt, IsDateString, IsOptional, IsString, Min } from "class-validator";
import { TransactionType } from "../entities/transaction.entity";

export class CreateTransactionDto {
  @ApiProperty({
    description: "Transaction amount (must be greater than 0)",
    example: 100.50,
    minimum: 0.01,
  })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({
    description: "Transaction type",
    enum: TransactionType,
    example: TransactionType.EXPENSE,
  })
  @IsEnum(TransactionType)
  type: TransactionType;

  @ApiProperty({
    description: "Category ID",
    example: 1,
  })
  @IsInt()
  categoryId: number;

  @ApiProperty({
    description: "Transaction date (YYYY-MM-DD format, cannot be in the future)",
    example: "2024-01-15",
  })
  @IsDateString()
  transactionDate: string;

  @ApiProperty({
    description: "Optional note",
    example: "Lunch at restaurant",
    required: false,
  })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiProperty({
    description: "Attachment file URL (set automatically after file upload)",
    example: "/uploads/transactions/1234567890-abc123.jpg",
    required: false,
  })
  @IsOptional()
  @IsString()
  attachmentUrl?: string;
}
