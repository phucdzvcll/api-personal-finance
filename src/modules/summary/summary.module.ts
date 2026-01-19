import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SummaryController } from "./summary.controller";
import { SummaryService } from "./summary.service";
import { TransactionEntity } from "../transactions/entities/transaction.entity";

@Module({
  imports: [TypeOrmModule.forFeature([TransactionEntity])],
  controllers: [SummaryController],
  providers: [SummaryService],
  exports: [SummaryService],
})
export class SummaryModule {}
