import { ApiProperty } from "@nestjs/swagger";
import { AuditLogResponseDto } from "./audit-log-response.dto";

export class AuditLogsListResponseDto {
  @ApiProperty({
    description: "List of audit logs",
    type: [AuditLogResponseDto],
  })
  data: AuditLogResponseDto[];

  @ApiProperty({
    description: "Total number of audit logs matching the query",
    example: 100,
  })
  total: number;

  @ApiProperty({
    description: "Current page number",
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: "Number of items per page",
    example: 20,
  })
  limit: number;

  @ApiProperty({
    description: "Total number of pages",
    example: 5,
  })
  totalPages: number;
}
