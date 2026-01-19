import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsOptional, IsEnum, IsInt, Min } from "class-validator";
import { AuditLogAction, AuditLogEntityType } from "../entities/audit-log.entity";

export class ListAuditLogsQueryDto {
  @ApiProperty({
    description: "Entity type to filter by",
    enum: AuditLogEntityType,
    required: false,
    example: AuditLogEntityType.TRANSACTION,
  })
  @IsOptional()
  @IsEnum(AuditLogEntityType)
  entityType?: AuditLogEntityType;

  @ApiProperty({
    description: "Action to filter by",
    enum: AuditLogAction,
    required: false,
    example: AuditLogAction.CREATE,
  })
  @IsOptional()
  @IsEnum(AuditLogAction)
  action?: AuditLogAction;

  @ApiProperty({
    description: "Entity ID to filter by",
    required: false,
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  entityId?: number;

  @ApiProperty({
    description: "Page number (1-based)",
    required: false,
    default: 1,
    minimum: 1,
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiProperty({
    description: "Number of items per page",
    required: false,
    default: 20,
    minimum: 1,
    maximum: 100,
    example: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;
}
