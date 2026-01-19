import { Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { AuditLogEntity, AuditLogAction, AuditLogEntityType } from "../entities/audit-log.entity";

@Injectable()
export class AuditLogRepository extends Repository<AuditLogEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(AuditLogEntity, dataSource.createEntityManager());
  }

  async findByUserIdWithFilters(
    userId: number,
    entityType?: AuditLogEntityType,
    action?: AuditLogAction,
    entityId?: number,
    page: number = 1,
    limit: number = 20
  ): Promise<{ data: AuditLogEntity[]; total: number }> {
    const queryBuilder = this.createQueryBuilder("auditLog")
      .where("auditLog.userId = :userId", { userId })
      .orderBy("auditLog.createdAt", "DESC");

    if (entityType) {
      queryBuilder.andWhere("auditLog.entityType = :entityType", { entityType });
    }

    if (action) {
      queryBuilder.andWhere("auditLog.action = :action", { action });
    }

    if (entityId) {
      queryBuilder.andWhere("auditLog.entityId = :entityId", { entityId });
    }

    const skip: number = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return { data, total };
  }
}

