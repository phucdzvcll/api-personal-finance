import { Injectable, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { TransactionEntity, TransactionType } from "../transactions/entities/transaction.entity";
import { MonthlySummaryResponseDto } from "./dto/monthly-summary-response.dto";
import { ExpenseByCategoryDto } from "./dto/expense-by-category.dto";

@Injectable()
export class SummaryService {
  constructor(
    @InjectRepository(TransactionEntity)
    private readonly transactionRepository: Repository<TransactionEntity>
  ) {}

  async getMonthlySummary(userId: number, year: number, month: number): Promise<MonthlySummaryResponseDto> {
    // Validate month range
    if (month < 1 || month > 12) {
      throw new BadRequestException("Invalid month parameter");
    }

    // Calculate total income
    const totalIncomeResult: { total: string | null } | undefined = await this.transactionRepository
      .createQueryBuilder("transaction")
      .select("COALESCE(SUM(transaction.amount), 0)", "total")
      .where("transaction.userId = :userId", { userId })
      .andWhere("transaction.type = :type", { type: TransactionType.INCOME })
      .andWhere("EXTRACT(YEAR FROM transaction.transactionDate) = :year", { year })
      .andWhere("EXTRACT(MONTH FROM transaction.transactionDate) = :month", { month })
      .getRawOne<{ total: string | null }>();

    const totalIncome: number = totalIncomeResult?.total ? parseFloat(totalIncomeResult.total) : 0;

    // Calculate total expense
    const totalExpenseResult: { total: string | null } | undefined = await this.transactionRepository
      .createQueryBuilder("transaction")
      .select("COALESCE(SUM(transaction.amount), 0)", "total")
      .where("transaction.userId = :userId", { userId })
      .andWhere("transaction.type = :type", { type: TransactionType.EXPENSE })
      .andWhere("EXTRACT(YEAR FROM transaction.transactionDate) = :year", { year })
      .andWhere("EXTRACT(MONTH FROM transaction.transactionDate) = :month", { month })
      .getRawOne<{ total: string | null }>();

    const totalExpense: number = totalExpenseResult?.total ? parseFloat(totalExpenseResult.total) : 0;

    // Calculate balance
    const balance: number = totalIncome - totalExpense;

    // Get expense breakdown by category
    const expenseByCategoryRaw: Array<{
      categoryId: number;
      categoryName: string;
      totalAmount: string;
      icon: string | null;
      color: string | null;
    }> = await this.transactionRepository
      .createQueryBuilder("transaction")
      .leftJoin("transaction.category", "category")
      .select("category.id", "categoryId")
      .addSelect("category.name", "categoryName")
      .addSelect("category.icon", "icon")
      .addSelect("category.color", "color")
      .addSelect("COALESCE(SUM(transaction.amount), 0)", "totalAmount")
      .where("transaction.userId = :userId", { userId })
      .andWhere("transaction.type = :type", { type: TransactionType.EXPENSE })
      .andWhere("EXTRACT(YEAR FROM transaction.transactionDate) = :year", { year })
      .andWhere("EXTRACT(MONTH FROM transaction.transactionDate) = :month", { month })
      .groupBy("category.id")
      .addGroupBy("category.name")
      .addGroupBy("category.icon")
      .addGroupBy("category.color")
      .orderBy("SUM(transaction.amount)", "DESC")
      .getRawMany<{
        categoryId: number;
        categoryName: string;
        totalAmount: string;
        icon: string | null;
        color: string | null;
      }>();

    // Calculate percentages and format response
    const expenseByCategory: ExpenseByCategoryDto[] = expenseByCategoryRaw.map(
      (item: {
        categoryId: number;
        categoryName: string;
        totalAmount: string;
        icon: string | null;
        color: string | null;
      }): ExpenseByCategoryDto => {
        const totalAmount: number = parseFloat(item.totalAmount);
        const percentage: number = totalExpense > 0 ? Math.round((totalAmount / totalExpense) * 100) : 0;

        return {
          categoryId: item.categoryId,
          categoryName: item.categoryName,
          totalAmount,
          percentage,
          icon: item.icon,
          color: item.color,
        };
      }
    );

    return {
      year,
      month,
      totalIncome,
      totalExpense,
      balance,
      expenseByCategory,
    };
  }
}
