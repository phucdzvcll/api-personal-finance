import { ApiProperty } from "@nestjs/swagger";
import { AuditLogAction, AuditLogEntityType } from "../entities/audit-log.entity";

export class AuditLogResponseDto {
  @ApiProperty({
    description: "Audit log ID (UUID)",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  id: string;

  @ApiProperty({
    description: "User ID who performed the action",
    example: 1,
  })
  userId: number;

  @ApiProperty({
    description: "Type of entity that was modified",
    enum: AuditLogEntityType,
    example: AuditLogEntityType.TRANSACTION,
  })
  entityType: AuditLogEntityType;

  @ApiProperty({
    description: "ID of the entity that was modified",
    example: 1,
  })
  entityId: number;

  @ApiProperty({
    description: "Action performed",
    enum: AuditLogAction,
    example: AuditLogAction.CREATE,
  })
  action: AuditLogAction;

  @ApiProperty({
    description: "Data before the change (null for CREATE actions)",
    example: { amount: 1000, note: "Old note" },
    nullable: true,
  })
  beforeData: Record<string, unknown> | null;

  @ApiProperty({
    description: "Data after the change (null for DELETE actions)",
    example: { amount: 2000, note: "New note" },
    nullable: true,
  })
  afterData: Record<string, unknown> | null;

  @ApiProperty({
    description: "Timestamp when the audit log was created",
    example: "2026-01-15T10:30:00.000Z",
  })
  createdAt: Date;
}
