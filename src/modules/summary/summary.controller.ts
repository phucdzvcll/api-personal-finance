import { Controller, Get, Query, UseGuards, HttpCode, HttpStatus } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from "@nestjs/swagger";
import { SummaryService } from "./summary.service";
import { MonthlySummaryQueryDto } from "./dto/monthly-summary-query.dto";
import { MonthlySummaryResponseDto } from "./dto/monthly-summary-response.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { GetUser } from "../../common/decorators/get-user.decorator";
import { UserEntity } from "../users/entities/user.entity";

@ApiTags("summary")
@Controller("summary")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth("JWT-auth")
export class SummaryController {
  constructor(private readonly summaryService: SummaryService) {}

  @Get("monthly")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get monthly financial summary" })
  @ApiQuery({ name: "year", type: Number, required: true, description: "Calendar year (e.g. 2026)" })
  @ApiQuery({ name: "month", type: Number, required: true, description: "Month (1-12)" })
  @ApiResponse({
    status: 200,
    description: "Monthly summary retrieved successfully",
    type: MonthlySummaryResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: "Invalid month parameter",
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized",
  })
  @ApiResponse({
    status: 500,
    description: "Internal server error",
  })
  async getMonthlySummary(
    @Query() query: MonthlySummaryQueryDto,
    @GetUser() user: UserEntity
  ): Promise<MonthlySummaryResponseDto> {
    return this.summaryService.getMonthlySummary(user.id, query.year, query.month);
  }
}
