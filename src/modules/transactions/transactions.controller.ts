import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery, ApiConsumes, ApiBody } from "@nestjs/swagger";
import { TransactionsService } from "./transactions.service";
import { CreateTransactionDto } from "./dto/create-transaction.dto";
import { UpdateTransactionDto } from "./dto/update-transaction.dto";
import { TransactionResponseDto } from "./dto/transaction-response.dto";
import { ListTransactionsQueryDto } from "./dto/list-transactions-query.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { GetUser } from "../../common/decorators/get-user.decorator";
import { UserEntity } from "../users/entities/user.entity";
import { FileStorageUtil } from "../../common/utils/file-storage.util";
import { multerConfig } from "../../common/config/multer.config";
import { ParseMultipartFormDataPipe } from "../../common/decorators/parse-multipart-form-data.decorator";

@ApiTags("transactions")
@Controller("transactions")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth("JWT-auth")
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  @UseInterceptors(FileInterceptor("attachment", multerConfig))
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create a new transaction" })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        amount: { type: "number", example: 100.5 },
        type: { type: "string", enum: ["income", "expense"], example: "expense" },
        categoryId: { type: "number", example: 1 },
        transactionDate: { type: "string", format: "date", example: "2024-01-15" },
        note: { type: "string", example: "Lunch at restaurant" },
        attachment: {
          type: "string",
          format: "binary",
          description: "Optional image or document attachment (max 10MB)",
        },
      },
      required: ["amount", "type", "categoryId", "transactionDate"],
    },
  })
  @ApiResponse({
    status: 201,
    description: "Transaction successfully created",
    type: TransactionResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: "Invalid transaction data (amount <= 0, future date, type mismatch) or invalid file",
  })
  @ApiResponse({
    status: 404,
    description: "Category not found",
  })
  async create(
    @GetUser() user: UserEntity,
    @Body(ParseMultipartFormDataPipe) createTransactionDto: CreateTransactionDto,
    @UploadedFile() file?: { filename: string; mimetype: string; size: number; originalname: string }
  ): Promise<TransactionResponseDto> {
    let attachmentUrl: string | undefined;

    if (file) {
      try {
        FileStorageUtil.validateFile(file);
        attachmentUrl = FileStorageUtil.getFileUrl(file.filename);
      } catch (error) {
        const errorMessage: string = error instanceof Error ? error.message : "Invalid file";
        throw new BadRequestException(errorMessage);
      }
    }

    return this.transactionsService.create(user.id, {
      ...createTransactionDto,
      attachmentUrl,
    });
  }

  @Get()
  @ApiOperation({ summary: "List all transactions for the authenticated user" })
  @ApiQuery({ name: "type", required: false, enum: ["income", "expense"], description: "Filter by transaction type" })
  @ApiQuery({ name: "categoryId", required: false, type: Number, description: "Filter by category ID" })
  @ApiQuery({ name: "startDate", required: false, type: String, description: "Start date (YYYY-MM-DD)" })
  @ApiQuery({ name: "endDate", required: false, type: String, description: "End date (YYYY-MM-DD)" })
  @ApiResponse({
    status: 200,
    description: "Transactions retrieved successfully",
    type: [TransactionResponseDto],
  })
  async findAll(@GetUser() user: UserEntity, @Query() query: ListTransactionsQueryDto): Promise<TransactionResponseDto[]> {
    return this.transactionsService.findAll(user.id, query.type, query.categoryId, query.startDate, query.endDate);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a transaction by ID" })
  @ApiParam({ name: "id", type: "number", description: "Transaction ID" })
  @ApiResponse({
    status: 200,
    description: "Transaction retrieved successfully",
    type: TransactionResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: "Transaction not found",
  })
  async findOne(@GetUser() user: UserEntity, @Param("id", ParseIntPipe) id: number): Promise<TransactionResponseDto> {
    return this.transactionsService.findOne(id, user.id);
  }

  @Patch(":id")
  @UseInterceptors(FileInterceptor("attachment", multerConfig))
  @ApiOperation({ summary: "Update a transaction" })
  @ApiConsumes("multipart/form-data")
  @ApiParam({ name: "id", type: "number", description: "Transaction ID" })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        amount: { type: "number", example: 150.75 },
        type: { type: "string", enum: ["income", "expense"], example: "expense" },
        categoryId: { type: "number", example: 2 },
        transactionDate: { type: "string", format: "date", example: "2024-01-16" },
        note: { type: "string", example: "Updated note" },
        attachment: {
          type: "string",
          format: "binary",
          description: "Optional image or document attachment (max 10MB)",
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: "Transaction successfully updated",
    type: TransactionResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: "Invalid transaction data (amount <= 0, future date, type mismatch) or invalid file",
  })
  @ApiResponse({
    status: 404,
    description: "Transaction or category not found",
  })
  async update(
    @GetUser() user: UserEntity,
    @Param("id", ParseIntPipe) id: number,
    @Body(ParseMultipartFormDataPipe) updateTransactionDto: UpdateTransactionDto,
    @UploadedFile() file?: { filename: string; mimetype: string; size: number; originalname: string }
  ): Promise<TransactionResponseDto> {
    let attachmentUrl: string | undefined;

    if (file) {
      try {
        FileStorageUtil.validateFile(file);
        attachmentUrl = FileStorageUtil.getFileUrl(file.filename);
      } catch (error) {
        const errorMessage: string = error instanceof Error ? error.message : "Invalid file";
        throw new BadRequestException(errorMessage);
      }
    }

    return this.transactionsService.update(id, user.id, {
      ...updateTransactionDto,
      attachmentUrl,
    });
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete a transaction" })
  @ApiParam({ name: "id", type: "number", description: "Transaction ID" })
  @ApiResponse({
    status: 204,
    description: "Transaction successfully deleted",
  })
  @ApiResponse({
    status: 404,
    description: "Transaction not found",
  })
  async remove(@GetUser() user: UserEntity, @Param("id", ParseIntPipe) id: number): Promise<void> {
    await this.transactionsService.remove(id, user.id);
  }
}
