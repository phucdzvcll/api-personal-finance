import { ApiProperty } from "@nestjs/swagger";
import { TransactionType } from "../entities/transaction.entity";
import { CategoryResponseDto } from "../../categories/dto/category-response.dto";

export class TransactionResponseDto {
  @ApiProperty({ description: "Transaction ID", example: 1 })
  id: number;

  @ApiProperty({ description: "Transaction amount", example: 100.50 })
  amount: number;

  @ApiProperty({
    description: "Transaction type",
    enum: TransactionType,
    example: TransactionType.EXPENSE,
  })
  type: TransactionType;

  @ApiProperty({ description: "Category ID", example: 1 })
  categoryId: number;

  @ApiProperty({ description: "Category details", type: CategoryResponseDto })
  category: CategoryResponseDto;

  @ApiProperty({ description: "Transaction date", example: "2024-01-15" })
  transactionDate: Date;

  @ApiProperty({ description: "Optional note", example: "Lunch at restaurant", nullable: true })
  note: string | null;

  @ApiProperty({
    description: "Attachment file URL (image or document)",
    example: "/uploads/transactions/1234567890-abc123.jpg",
    nullable: true,
  })
  attachmentUrl: string | null;

  @ApiProperty({ description: "Transaction creation date" })
  createdAt: Date;

  @ApiProperty({ description: "Transaction last update date" })
  updatedAt: Date;
}
