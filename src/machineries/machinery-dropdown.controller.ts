import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MachineriesService } from './machineries.service';

/**
 * Separate controller so GET machineries/dropdown/list is never shadowed by GET machineries/:id.
 */
@ApiTags('machineries')
@Controller('machineries/dropdown')
export class MachineryDropdownController {
  constructor(private readonly machineriesService: MachineriesService) {}

  @Get('list')
  @ApiOperation({ summary: 'List active machineries for dropdowns (id and title)' })
  @ApiResponse({ status: 200, description: 'Machinery options for forms.' })
  async getDropdown() {
    return this.machineriesService.getDropdown();
  }
}
