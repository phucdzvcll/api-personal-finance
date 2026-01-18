import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, QueryRunner } from "typeorm";
import { AuditLogRepository } from "./repositories/audit-log.repository";
import { AuditLogEntity, AuditLogAction, AuditLogEntityType } from "./entities/audit-log.entity";

export interface CreateAuditLogDto {
  userId: number;
  entityType: AuditLogEntityType;
  entityId: number;
  action: AuditLogAction;
  beforeData: Record<string, unknown> | null;
  afterData: Record<string, unknown> | null;
}

@Injectable()
export class AuditLogsService {
  constructor(
    @InjectRepository(AuditLogRepository)
    private readonly auditLogRepository: AuditLogRepository,
    private readonly dataSource: DataSource
  ) {}

  async create(createAuditLogDto: CreateAuditLogDto, queryRunner?: QueryRunner): Promise<AuditLogEntity> {
    const auditLog: AuditLogEntity = this.auditLogRepository.create({
      userId: createAuditLogDto.userId,
      entityType: createAuditLogDto.entityType,
      entityId: createAuditLogDto.entityId,
      action: createAuditLogDto.action,
      beforeData: createAuditLogDto.beforeData,
      afterData: createAuditLogDto.afterData,
    });

    if (queryRunner) {
      return queryRunner.manager.save(AuditLogEntity, auditLog);
    }

    return this.auditLogRepository.save(auditLog);
  }
}

