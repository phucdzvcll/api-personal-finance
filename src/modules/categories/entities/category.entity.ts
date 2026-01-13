import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { UserEntity } from "../../users/entities/user.entity";

export enum CategoryType {
  INCOME = "income",
  EXPENSE = "expense",
}

@Entity("categories")
export class CategoryEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "user_id" })
  userId: number;

  @Column({ type: "varchar" })
  name: string;

  @Column({
    type: "enum",
    enum: CategoryType,
  })
  type: CategoryType;

  @Column({ type: "varchar", nullable: true })
  icon: string | null;

  @Column({ type: "varchar", nullable: true })
  color: string | null;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: "user_id" })
  user: UserEntity;
}
