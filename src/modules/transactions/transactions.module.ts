import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TransactionsService } from "./transactions.service";
import { TransactionsController } from "./transactions.controller";
import { TransactionRepository } from "./repositories/transaction.repository";
import { TransactionEntity } from "./entities/transaction.entity";
import { CategoriesModule } from "../categories/categories.module";

@Module({
  imports: [TypeOrmModule.forFeature([TransactionEntity]), CategoriesModule],
  controllers: [TransactionsController],
  providers: [TransactionsService, TransactionRepository],
  exports: [TransactionsService],
})
export class TransactionsModule {}
