import { Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { TransactionEntity, TransactionType } from "../entities/transaction.entity";

@Injectable()
export class TransactionRepository extends Repository<TransactionEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(TransactionEntity, dataSource.createEntityManager());
  }

  async findByUserId(userId: number): Promise<TransactionEntity[]> {
    return this.find({
      where: { userId },
      relations: ["category"],
      order: { transactionDate: "DESC", createdAt: "DESC" },
    });
  }

  async findByUserIdAndType(userId: number, type: TransactionType): Promise<TransactionEntity[]> {
    return this.find({
      where: { userId, type },
      relations: ["category"],
      order: { transactionDate: "DESC", createdAt: "DESC" },
    });
  }


  async findByUserIdAndFilters(
    userId: number,
    type?: TransactionType,
    startDate?: Date,
    endDate?: Date
  ): Promise<TransactionEntity[]> {
    const queryBuilder = this.createQueryBuilder("transaction")
      .leftJoinAndSelect("transaction.category", "category")
      .where("transaction.userId = :userId", { userId })
      .orderBy("transaction.transactionDate", "DESC")
      .addOrderBy("transaction.createdAt", "DESC");

    if (type) {
      queryBuilder.andWhere("transaction.type = :type", { type });
    }

    if (startDate) {
      queryBuilder.andWhere("transaction.transactionDate >= :startDate", { startDate });
    }

    if (endDate) {
      queryBuilder.andWhere("transaction.transactionDate <= :endDate", { endDate });
    }

    return queryBuilder.getMany();
  }

  async findByIdAndUserId(id: number, userId: number): Promise<TransactionEntity | null> {
    return this.findOne({
      where: { id, userId },
      relations: ["category"],
    });
  }
}
