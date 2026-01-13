import { Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { CategoryEntity, CategoryType } from "../entities/category.entity";

@Injectable()
export class CategoryRepository extends Repository<CategoryEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(CategoryEntity, dataSource.createEntityManager());
  }

  async findByUserIdAndType(userId: number, type: CategoryType): Promise<CategoryEntity[]> {
    return this.find({
      where: { userId, type },
      order: { createdAt: "ASC" },
    });
  }

  async findByUserId(userId: number): Promise<CategoryEntity[]> {
    return this.find({
      where: { userId },
      order: { createdAt: "ASC" },
    });
  }

  async findByIdAndUserId(id: number, userId: number): Promise<CategoryEntity | null> {
    return this.findOne({
      where: { id, userId },
    });
  }

  async findByNameAndUserIdAndType(name: string, userId: number, type: CategoryType): Promise<CategoryEntity | null> {
    return this.findOne({
      where: { name, userId, type },
    });
  }

  async countTransactionsByCategoryId(categoryId: number): Promise<number> {
    const result = await this.manager
      .createQueryBuilder()
      .select("COUNT(*)", "count")
      .from("transactions", "transaction")
      .where("transaction.category_id = :categoryId", { categoryId })
      .getRawOne<{ count: string }>();

    return result ? parseInt(result.count, 10) : 0;
  }
}
