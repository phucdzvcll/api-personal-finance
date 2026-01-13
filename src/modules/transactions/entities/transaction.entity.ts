import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { UserEntity } from "../../users/entities/user.entity";
import { CategoryEntity } from "../../categories/entities/category.entity";

export enum TransactionType {
  INCOME = "income",
  EXPENSE = "expense",
}

@Entity("transactions")
export class TransactionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "user_id" })
  userId: number;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  amount: number;

  @Column({
    type: "enum",
    enum: TransactionType,
  })
  type: TransactionType;

  @Column({ name: "category_id" })
  categoryId: number;

  @Column({ name: "transaction_date", type: "date" })
  transactionDate: Date;

  @Column({ type: "text", nullable: true })
  note: string | null;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: "user_id" })
  user: UserEntity;

  @ManyToOne(() => CategoryEntity)
  @JoinColumn({ name: "category_id" })
  category: CategoryEntity;
}
