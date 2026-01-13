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
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from "@nestjs/swagger";
import { TransactionsService } from "./transactions.service";
import { CreateTransactionDto } from "./dto/create-transaction.dto";
import { UpdateTransactionDto } from "./dto/update-transaction.dto";
import { TransactionResponseDto } from "./dto/transaction-response.dto";
import { ListTransactionsQueryDto } from "./dto/list-transactions-query.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { GetUser } from "../../common/decorators/get-user.decorator";
import { UserEntity } from "../users/entities/user.entity";

@ApiTags("transactions")
@Controller("transactions")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth("JWT-auth")
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create a new transaction" })
  @ApiResponse({
    status: 201,
    description: "Transaction successfully created",
    type: TransactionResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: "Invalid transaction data (amount <= 0, future date, type mismatch)",
  })
  @ApiResponse({
    status: 404,
    description: "Category not found",
  })
  async create(@GetUser() user: UserEntity, @Body() createTransactionDto: CreateTransactionDto): Promise<TransactionResponseDto> {
    return this.transactionsService.create(user.id, createTransactionDto);
  }

  @Get()
  @ApiOperation({ summary: "List all transactions for the authenticated user" })
  @ApiQuery({ name: "type", required: false, enum: ["income", "expense"], description: "Filter by transaction type" })
  @ApiQuery({ name: "startDate", required: false, type: String, description: "Start date (YYYY-MM-DD)" })
  @ApiQuery({ name: "endDate", required: false, type: String, description: "End date (YYYY-MM-DD)" })
  @ApiResponse({
    status: 200,
    description: "Transactions retrieved successfully",
    type: [TransactionResponseDto],
  })
  async findAll(@GetUser() user: UserEntity, @Query() query: ListTransactionsQueryDto): Promise<TransactionResponseDto[]> {
    return this.transactionsService.findAll(user.id, query.type, query.startDate, query.endDate);
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
  @ApiOperation({ summary: "Update a transaction" })
  @ApiParam({ name: "id", type: "number", description: "Transaction ID" })
  @ApiResponse({
    status: 200,
    description: "Transaction successfully updated",
    type: TransactionResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: "Invalid transaction data (amount <= 0, future date, type mismatch)",
  })
  @ApiResponse({
    status: 404,
    description: "Transaction or category not found",
  })
  async update(
    @GetUser() user: UserEntity,
    @Param("id", ParseIntPipe) id: number,
    @Body() updateTransactionDto: UpdateTransactionDto
  ): Promise<TransactionResponseDto> {
    return this.transactionsService.update(id, user.id, updateTransactionDto);
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
