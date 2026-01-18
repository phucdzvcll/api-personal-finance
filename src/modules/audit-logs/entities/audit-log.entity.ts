import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { UserEntity } from "../../users/entities/user.entity";

export enum AuditLogAction {
  CREATE = "CREATE",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
}

export enum AuditLogEntityType {
  TRANSACTION = "transaction",
}

@Entity("audit_logs")
export class AuditLogEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "user_id" })
  userId: number;

  @Column({ name: "entity_type", type: "varchar" })
  entityType: AuditLogEntityType;

  @Column({ name: "entity_id", type: "integer" })
  entityId: number;

  @Column({
    type: "enum",
    enum: AuditLogAction,
  })
  action: AuditLogAction;

  @Column({ name: "before_data", type: "jsonb", nullable: true })
  beforeData: Record<string, unknown> | null;

  @Column({ name: "after_data", type: "jsonb", nullable: true })
  afterData: Record<string, unknown> | null;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: "user_id" })
  user: UserEntity;
}

