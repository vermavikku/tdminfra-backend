import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query } from '@nestjs/common';
import { EnquiriesService } from './enquiries.service';
import { CreateEnquiryDto } from './dto/create-enquiry.dto';
import { UpdateEnquiryDto } from './dto/update-enquiry.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { EnquiryStatus, ENQUIRY_STATUS_VALUES } from '../common/enums/statuses';
import { Enquiry } from './entities/enquiry.entity';

@ApiTags('enquiries')
@Controller('enquiries')
export class EnquiriesController {
  constructor(private readonly enquiriesService: EnquiriesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new enquiry' })
  @ApiResponse({ status: 201, description: 'The enquiry has been successfully created.', type: Enquiry })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  async create(@Body() createEnquiryDto: CreateEnquiryDto): Promise<Enquiry> {
    return this.enquiriesService.create(createEnquiryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all enquiries with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10)' })
  @ApiQuery({ name: 'status', required: false, enum: ENQUIRY_STATUS_VALUES, description: 'Filter enquiries by status' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved enquiries with pagination.' })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: EnquiryStatus
  ): Promise<{ data: any[]; total: number; page: number; limit: number }> {
    return this.enquiriesService.findAll({ page, limit, status });
  }

  @Get('recent')
  @ApiOperation({ summary: 'Retrieve recent enquiries for dashboard' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of recent enquiries to retrieve (default: 5)' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved recent enquiries.', type: [Enquiry] })
  async getRecent(@Query('limit') limit: number = 5): Promise<any[]> {
    return this.enquiriesService.getRecent(limit);
  }

  @Get('chart-data')
  @ApiOperation({ summary: 'Retrieve enquiries chart data for dashboard' })
  @ApiQuery({ name: 'months', required: false, type: Number, description: 'Number of months to retrieve data for (default: 6)' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved chart data.' })
  async getChartData(@Query('months') months: number = 6): Promise<any[]> {
    return this.enquiriesService.getChartData(months);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve an enquiry by ID' })
  @ApiParam({ name: 'id', description: 'ID of the enquiry to retrieve', type: Number })
  @ApiResponse({ status: 200, description: 'Successfully retrieved the enquiry.', type: Enquiry })
  @ApiResponse({ status: 404, description: 'Enquiry not found.' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Enquiry | null> {
    return this.enquiriesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an enquiry by ID' })
  @ApiParam({ name: 'id', description: 'ID of the enquiry to update', type: Number })
  @ApiResponse({ status: 200, description: 'The enquiry has been successfully updated.', type: Enquiry })
  @ApiResponse({ status: 404, description: 'Enquiry not found.' })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateEnquiryDto: UpdateEnquiryDto): Promise<Enquiry> {
    return this.enquiriesService.update(id, updateEnquiryDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an enquiry by ID' })
  @ApiParam({ name: 'id', description: 'ID of the enquiry to delete', type: Number })
  @ApiResponse({ status: 200, description: 'The enquiry has been successfully deleted.', type: Enquiry })
  @ApiResponse({ status: 404, description: 'Enquiry not found.' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<Enquiry> {
    return this.enquiriesService.remove(id);
  }
}
