import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { TransactionRepository } from "./repositories/transaction.repository";
import { TransactionEntity, TransactionType } from "./entities/transaction.entity";
import { CreateTransactionDto } from "./dto/create-transaction.dto";
import { UpdateTransactionDto } from "./dto/update-transaction.dto";
import { TransactionResponseDto } from "./dto/transaction-response.dto";
import { CategoriesService } from "../categories/categories.service";
import { CategoryType } from "../categories/entities/category.entity";
import { CategoryResponseDto } from "../categories/dto/category-response.dto";

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(TransactionRepository)
    private readonly transactionRepository: TransactionRepository,
    private readonly categoriesService: CategoriesService
  ) {}

  async create(userId: number, createTransactionDto: CreateTransactionDto): Promise<TransactionResponseDto> {
    // Validate transaction date is not in the future
    const transactionDate: Date = new Date(createTransactionDto.transactionDate);
    const today: Date = new Date();
    today.setHours(0, 0, 0, 0);

    if (transactionDate > today) {
      throw new BadRequestException("Transaction date cannot be in the future");
    }

    // Validate category exists and belongs to user
    const category: CategoryResponseDto = await this.categoriesService.findOne(createTransactionDto.categoryId, userId);

    // Validate transaction type matches category type
    const categoryType: CategoryType = category.type === CategoryType.INCOME ? CategoryType.INCOME : CategoryType.EXPENSE;
    const transactionType: TransactionType =
      createTransactionDto.type === TransactionType.INCOME ? TransactionType.INCOME : TransactionType.EXPENSE;

    if (
      (categoryType === CategoryType.INCOME && transactionType !== TransactionType.INCOME) ||
      (categoryType === CategoryType.EXPENSE && transactionType !== TransactionType.EXPENSE)
    ) {
      throw new BadRequestException(`Transaction type "${createTransactionDto.type}" does not match category type "${category.type}"`);
    }

    // Create transaction
    const transaction: TransactionEntity = this.transactionRepository.create({
      userId,
      amount: createTransactionDto.amount,
      type: createTransactionDto.type,
      categoryId: createTransactionDto.categoryId,
      transactionDate,
      note: createTransactionDto.note ?? null,
    });

    const savedTransaction: TransactionEntity = await this.transactionRepository.save(transaction);

    // Load category relation
    const transactionWithCategory: TransactionEntity | null = await this.transactionRepository.findByIdAndUserId(
      savedTransaction.id,
      userId
    );

    if (!transactionWithCategory) {
      throw new NotFoundException("Transaction not found after creation");
    }

    return this.toResponseDto(transactionWithCategory);
  }

  async findAll(userId: number, type?: TransactionType, startDate?: string, endDate?: string): Promise<TransactionResponseDto[]> {
    const startDateObj: Date | undefined = startDate ? new Date(startDate) : undefined;
    const endDateObj: Date | undefined = endDate ? new Date(endDate) : undefined;

    const transactions: TransactionEntity[] = await this.transactionRepository.findByUserIdAndFilters(
      userId,
      type,
      startDateObj,
      endDateObj
    );

    return transactions.map((transaction) => this.toResponseDto(transaction));
  }

  async findOne(id: number, userId: number): Promise<TransactionResponseDto> {
    const transaction: TransactionEntity | null = await this.transactionRepository.findByIdAndUserId(id, userId);

    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }

    return this.toResponseDto(transaction);
  }

  async update(id: number, userId: number, updateTransactionDto: UpdateTransactionDto): Promise<TransactionResponseDto> {
    const transaction: TransactionEntity | null = await this.transactionRepository.findByIdAndUserId(id, userId);

    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }

    // Validate transaction date if being updated
    if (updateTransactionDto.transactionDate) {
      const transactionDate: Date = new Date(updateTransactionDto.transactionDate);
      const today: Date = new Date();
      today.setHours(0, 0, 0, 0);

      if (transactionDate > today) {
        throw new BadRequestException("Transaction date cannot be in the future");
      }
    }

    // Validate category if being updated
    if (updateTransactionDto.categoryId) {
      const category: CategoryResponseDto = await this.categoriesService.findOne(updateTransactionDto.categoryId, userId);

      // Validate transaction type matches category type (if type is also being updated)
      const newType: TransactionType = updateTransactionDto.type ?? transaction.type;
      const categoryType: CategoryType = category.type === CategoryType.INCOME ? CategoryType.INCOME : CategoryType.EXPENSE;

      if (
        (categoryType === CategoryType.INCOME && newType !== TransactionType.INCOME) ||
        (categoryType === CategoryType.EXPENSE && newType !== TransactionType.EXPENSE)
      ) {
        throw new BadRequestException(`Transaction type "${newType}" does not match category type "${category.type}"`);
      }
    } else if (updateTransactionDto.type) {
      // If only type is being updated, validate it matches the current category
      const category: CategoryResponseDto = await this.categoriesService.findOne(transaction.categoryId, userId);
      const categoryType: CategoryType = category.type === CategoryType.INCOME ? CategoryType.INCOME : CategoryType.EXPENSE;

      if (
        (categoryType === CategoryType.INCOME && updateTransactionDto.type !== TransactionType.INCOME) ||
        (categoryType === CategoryType.EXPENSE && updateTransactionDto.type !== TransactionType.EXPENSE)
      ) {
        throw new BadRequestException(`Transaction type "${updateTransactionDto.type}" does not match category type "${category.type}"`);
      }
    }

    // Update transaction
    Object.assign(transaction, {
      amount: updateTransactionDto.amount ?? transaction.amount,
      type: updateTransactionDto.type ?? transaction.type,
      categoryId: updateTransactionDto.categoryId ?? transaction.categoryId,
      transactionDate: updateTransactionDto.transactionDate ? new Date(updateTransactionDto.transactionDate) : transaction.transactionDate,
      note: updateTransactionDto.note !== undefined ? updateTransactionDto.note : transaction.note,
    });

    const updatedTransaction: TransactionEntity = await this.transactionRepository.save(transaction);

    // Load category relation
    const transactionWithCategory: TransactionEntity | null = await this.transactionRepository.findByIdAndUserId(
      updatedTransaction.id,
      userId
    );

    if (!transactionWithCategory) {
      throw new NotFoundException("Transaction not found after update");
    }

    return this.toResponseDto(transactionWithCategory);
  }

  async remove(id: number, userId: number): Promise<void> {
    const transaction: TransactionEntity | null = await this.transactionRepository.findByIdAndUserId(id, userId);

    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }

    await this.transactionRepository.remove(transaction);
  }

  private toResponseDto(transaction: TransactionEntity): TransactionResponseDto {
    return {
      id: transaction.id,
      amount: Number(transaction.amount),
      type: transaction.type,
      categoryId: transaction.categoryId,
      category: {
        id: transaction.category.id,
        name: transaction.category.name,
        type: transaction.category.type,
        icon: transaction.category.icon,
        color: transaction.category.color,
        createdAt: transaction.category.createdAt,
        updatedAt: transaction.category.updatedAt,
      },
      transactionDate: transaction.transactionDate,
      note: transaction.note,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
    };
  }
}
