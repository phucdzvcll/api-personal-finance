import { Controller, Get, Query, UseGuards, HttpCode, HttpStatus } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger";
import { AuditLogsService } from "./audit-logs.service";
import { ListAuditLogsQueryDto } from "./dto/list-audit-logs-query.dto";
import { AuditLogsListResponseDto } from "./dto/audit-logs-list-response.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { GetUser } from "../../common/decorators/get-user.decorator";
import { UserEntity } from "../users/entities/user.entity";

@ApiTags("audit-logs")
@Controller("audit-logs")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth("JWT-auth")
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get audit logs for the current user" })
  @ApiResponse({
    status: 200,
    description: "Audit logs retrieved successfully",
    type: AuditLogsListResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized",
  })
  @ApiResponse({
    status: 500,
    description: "Internal server error",
  })
  async findAll(
    @Query() query: ListAuditLogsQueryDto,
    @GetUser() user: UserEntity
  ): Promise<AuditLogsListResponseDto> {
    return this.auditLogsService.findAll(user.id, query);
  }
}
