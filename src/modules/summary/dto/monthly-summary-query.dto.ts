import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, Min, Max } from "class-validator";

export class MonthlySummaryQueryDto {
  @ApiProperty({
    description: "Calendar year (e.g. 2026)",
    example: 2026,
    minimum: 1900,
    maximum: 2100,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1900)
  @Max(2100)
  year: number;

  @ApiProperty({
    description: "Month (1-12)",
    example: 1,
    minimum: 1,
    maximum: 12,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  month: number;
}
