import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuditLogsService } from "./audit-logs.service";
import { AuditLogRepository } from "./repositories/audit-log.repository";
import { AuditLogEntity } from "./entities/audit-log.entity";

@Module({
  imports: [TypeOrmModule.forFeature([AuditLogEntity])],
  providers: [AuditLogsService, AuditLogRepository],
  exports: [AuditLogsService],
})
export class AuditLogsModule {}

