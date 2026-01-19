import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, QueryRunner } from "typeorm";
import { AuditLogRepository } from "./repositories/audit-log.repository";
import { AuditLogEntity, AuditLogAction, AuditLogEntityType } from "./entities/audit-log.entity";
import { ListAuditLogsQueryDto } from "./dto/list-audit-logs-query.dto";
import { AuditLogsListResponseDto } from "./dto/audit-logs-list-response.dto";
import { AuditLogResponseDto } from "./dto/audit-log-response.dto";

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

  async findAll(
    userId: number,
    query: ListAuditLogsQueryDto
  ): Promise<AuditLogsListResponseDto> {
    const page: number = query.page || 1;
    const limit: number = query.limit || 20;

    const { data, total } = await this.auditLogRepository.findByUserIdWithFilters(
      userId,
      query.entityType,
      query.action,
      query.entityId,
      page,
      limit
    );

    const totalPages: number = Math.ceil(total / limit);

    const auditLogs: AuditLogResponseDto[] = data.map(
      (log: AuditLogEntity): AuditLogResponseDto => ({
        id: log.id,
        userId: log.userId,
        entityType: log.entityType,
        entityId: log.entityId,
        action: log.action,
        beforeData: log.beforeData,
        afterData: log.afterData,
        createdAt: log.createdAt,
      })
    );

    return {
      data: auditLogs,
      total,
      page,
      limit,
      totalPages,
    };
  }
}

