import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { DashboardSummaryDto } from './dto/summary.dto';

@ApiTags('dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get('summary')
  @ApiOkResponse({ description: 'Dashboard summary with counts', type: DashboardSummaryDto })
  async getSummary() {
    return this.dashboardService.getSummary();
  }
}
