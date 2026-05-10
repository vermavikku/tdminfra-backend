import { ApiProperty } from '@nestjs/swagger';

export class DashboardSummaryDto {
  @ApiProperty({ example: 12 })
  totalMachineries: number;

  @ApiProperty({ example: 142 })
  totalEnquiries: number;

  @ApiProperty({ example: 10 })
  pendingEnquiries: number;

  @ApiProperty({ example: 132 })
  completedEnquiries: number;
}
