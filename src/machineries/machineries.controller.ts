import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MachineriesService } from './machineries.service';
import { CreateMachineryDto } from './dto/create-machinery.dto';
import { UpdateMachineryDto } from './dto/update-machinery.dto';
import { QueryMachineryDto } from './dto/query-machinery.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { Machinery } from './entities/machinery.entity';
import { S3Service } from '../common/s3/s3.service';
import * as multer from 'multer';

@ApiTags('machineries')
@Controller('machineries')
export class MachineriesController {
  constructor(
    private readonly machineriesService: MachineriesService,
    private readonly uploadService: S3Service,
  ) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('image', {
      storage: multer.memoryStorage(),
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
        category_code: { type: 'string' },
        image: {
          type: 'string',
          format: 'binary',
        },
        status: {
          type: 'string',
          enum: ['active', 'inactive'],
        },
      },
      required: ['title', 'category_code'],
    },
  })
  @ApiOperation({
    summary: 'Create a new machinery with an optional image upload',
  })
  @ApiResponse({
    status: 201,
    description: 'The machinery has been successfully created.',
    type: Machinery,
  })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  async create(
    @Body() createMachineryDto: CreateMachineryDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<Machinery> {
    let imageUrl: string | undefined;
    if (file) {
      imageUrl = await this.uploadService.uploadFile(file, 'machineries');
    }
    return this.machineriesService.create({
      ...createMachineryDto,
      image_url: imageUrl,
    });
  }

  @Get()
  @ApiOperation({
    summary: 'Retrieve all machineries with pagination and filtering',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10)',
  })
  @ApiQuery({
    name: 'title',
    required: false,
    type: String,
    description: 'Filter by machinery title',
  })
  @ApiQuery({
    name: 'category_code',
    required: false,
    type: String,
    description: 'Filter by category code',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['active', 'inactive'],
    description: 'Filter by machinery status',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved machineries.',
    type: [Machinery],
  })
  async findAll(@Query() query: QueryMachineryDto) {
    return this.machineriesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a machinery by ID' })
  @ApiParam({
    name: 'id',
    description: 'ID of the machinery to retrieve',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved the machinery.',
    type: Machinery,
  })
  @ApiResponse({ status: 404, description: 'Machinery not found.' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Machinery | null> {
    return this.machineriesService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
        category_code: { type: 'string' },
        image: {
          type: 'string',
          format: 'binary',
        },
        status: {
          type: 'string',
          enum: ['active', 'inactive'],
        },
      },
    },
  })
  @ApiOperation({
    summary: 'Update a machinery by ID with an optional image upload',
  })
  @ApiParam({
    name: 'id',
    description: 'ID of the machinery to update',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'The machinery has been successfully updated.',
    type: Machinery,
  })
  @ApiResponse({ status: 404, description: 'Machinery not found.' })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMachineryDto: UpdateMachineryDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<Machinery> {
    let imageUrl: string | undefined;
    if (file) {
      imageUrl = await this.uploadService.uploadFile(file, 'machineries');
    }
    return this.machineriesService.update(id, {
      ...updateMachineryDto,
      image_url: imageUrl,
    });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a machinery by ID' })
  @ApiParam({
    name: 'id',
    description: 'ID of the machinery to delete',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'The machinery has been successfully deleted.',
    type: Machinery,
  })
  @ApiResponse({ status: 404, description: 'Machinery not found.' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<Machinery> {
    return this.machineriesService.remove(id);
  }
}
