import { Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { AuditLogEntity } from "../entities/audit-log.entity";

@Injectable()
export class AuditLogRepository extends Repository<AuditLogEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(AuditLogEntity, dataSource.createEntityManager());
  }
}

