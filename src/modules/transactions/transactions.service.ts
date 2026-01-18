import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { TransactionRepository } from "./repositories/transaction.repository";
import { TransactionEntity, TransactionType } from "./entities/transaction.entity";
import { CreateTransactionDto } from "./dto/create-transaction.dto";
import { UpdateTransactionDto } from "./dto/update-transaction.dto";
import { TransactionResponseDto } from "./dto/transaction-response.dto";
import { CategoriesService } from "../categories/categories.service";
import { CategoryType } from "../categories/entities/category.entity";
import { CategoryResponseDto } from "../categories/dto/category-response.dto";
import { AuditLogsService } from "../audit-logs/audit-logs.service";
import { AuditLogAction, AuditLogEntityType } from "../audit-logs/entities/audit-log.entity";

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(TransactionRepository)
    private readonly transactionRepository: TransactionRepository,
    private readonly categoriesService: CategoriesService,
    private readonly auditLogsService: AuditLogsService,
    private readonly dataSource: DataSource
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

    // Create transaction with atomic audit log
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Create transaction
      const transaction: TransactionEntity = this.transactionRepository.create({
        userId,
        amount: createTransactionDto.amount,
        type: createTransactionDto.type,
        categoryId: createTransactionDto.categoryId,
        transactionDate,
        note: createTransactionDto.note ?? null,
      });

      const savedTransaction: TransactionEntity = await queryRunner.manager.save(TransactionEntity, transaction);

      // Create audit log
      await this.auditLogsService.create(
        {
          userId,
          entityType: AuditLogEntityType.TRANSACTION,
          entityId: savedTransaction.id,
          action: AuditLogAction.CREATE,
          beforeData: null,
          afterData: this.serializeTransactionForAudit(savedTransaction),
        },
        queryRunner
      );

      await queryRunner.commitTransaction();

      // Load category relation
      const transactionWithCategory: TransactionEntity | null = await this.transactionRepository.findByIdAndUserId(
        savedTransaction.id,
        userId
      );

      if (!transactionWithCategory) {
        throw new NotFoundException("Transaction not found after creation");
      }

      return this.toResponseDto(transactionWithCategory);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
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

    // Store before state for audit log
    const beforeData: Record<string, unknown> = this.serializeTransactionForAudit(transaction);

    // Prepare update data
    const updateData: Partial<TransactionEntity> = {};
    if (updateTransactionDto.amount !== undefined) {
      updateData.amount = updateTransactionDto.amount;
    }
    if (updateTransactionDto.type !== undefined) {
      updateData.type = updateTransactionDto.type;
    }
    if (updateTransactionDto.categoryId !== undefined) {
      updateData.categoryId = updateTransactionDto.categoryId;
    }
    if (updateTransactionDto.transactionDate !== undefined) {
      updateData.transactionDate = new Date(updateTransactionDto.transactionDate);
    }
    if (updateTransactionDto.note !== undefined) {
      updateData.note = updateTransactionDto.note;
    }

    // Update transaction with atomic audit log
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Update transaction using update() to ensure categoryId changes are persisted
      await queryRunner.manager.update(TransactionEntity, { id, userId }, updateData);

      // Reload the updated transaction within the transaction
      const updatedTransaction: TransactionEntity | null = await queryRunner.manager.findOne(TransactionEntity, {
        where: { id, userId },
        relations: ["category"],
      });

      if (!updatedTransaction) {
        throw new NotFoundException("Transaction not found after update");
      }

      // Create audit log
      await this.auditLogsService.create(
        {
          userId,
          entityType: AuditLogEntityType.TRANSACTION,
          entityId: updatedTransaction.id,
          action: AuditLogAction.UPDATE,
          beforeData,
          afterData: this.serializeTransactionForAudit(updatedTransaction),
        },
        queryRunner
      );

      await queryRunner.commitTransaction();

      return this.toResponseDto(updatedTransaction);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: number, userId: number): Promise<void> {
    const transaction: TransactionEntity | null = await this.transactionRepository.findByIdAndUserId(id, userId);

    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }

    // Store before state for audit log
    const beforeData: Record<string, unknown> = this.serializeTransactionForAudit(transaction);

    // Delete transaction with atomic audit log
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.remove(TransactionEntity, transaction);

      // Create audit log
      await this.auditLogsService.create(
        {
          userId,
          entityType: AuditLogEntityType.TRANSACTION,
          entityId: transaction.id,
          action: AuditLogAction.DELETE,
          beforeData,
          afterData: null,
        },
        queryRunner
      );

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
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

  private serializeTransactionForAudit(transaction: TransactionEntity): Record<string, unknown> {
    return {
      id: transaction.id,
      userId: transaction.userId,
      amount: Number(transaction.amount),
      type: transaction.type,
      categoryId: transaction.categoryId,
      transactionDate: transaction.transactionDate instanceof Date ? transaction.transactionDate.toISOString() : transaction.transactionDate,
      note: transaction.note,
      createdAt: transaction.createdAt instanceof Date ? transaction.createdAt.toISOString() : transaction.createdAt,
      updatedAt: transaction.updatedAt instanceof Date ? transaction.updatedAt.toISOString() : transaction.updatedAt,
    };
  }
}
