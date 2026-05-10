import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProfilesService } from './profiles.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { Profile } from './entities/profile.entity';
import { S3Service } from '../common/s3/s3.service';

@ApiTags('profiles')
@Controller('profiles')
export class ProfilesController {
  constructor(
    private readonly profilesService: ProfilesService,
    private readonly uploadService: S3Service,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('logo'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        logo: {
          type: 'string',
          format: 'binary',
        },
        phones: {
          type: 'array',
          items: { type: 'string' },
          example: ['+1-202-555-0182'],
        },
        emails: {
          type: 'array',
          items: { type: 'string' },
          example: ['support@company.com'],
        },
        address: { type: 'string' },
        business_hours: {
          type: 'object',
          example: { type: '24/7' },
        },
      },
    },
  })
  @ApiOperation({ summary: 'Create a new profile with an optional logo upload' })
  @ApiResponse({ status: 201, description: 'The profile has been successfully created.', type: Profile })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  async create(
    @Body() createProfileDto: any,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<Profile> {
    let logoUrl: string | undefined;
    if (file) {
      logoUrl = await this.uploadService.uploadFile(file, 'logo');
    }

    // Parse JSON strings back to arrays for multipart form data
    const processedDto = { ...createProfileDto };
    if (processedDto.phones && typeof processedDto.phones === 'string') {
      try {
        processedDto.phones = JSON.parse(processedDto.phones);
      } catch (e) {
        processedDto.phones = [];
      }
    }
    if (processedDto.emails && typeof processedDto.emails === 'string') {
      try {
        processedDto.emails = JSON.parse(processedDto.emails);
      } catch (e) {
        processedDto.emails = [];
      }
    }
    if (processedDto.business_hours && typeof processedDto.business_hours === 'string') {
      try {
        processedDto.business_hours = JSON.parse(processedDto.business_hours);
      } catch (e) {
        processedDto.business_hours = undefined;
      }
    }

    return this.profilesService.create({ ...processedDto, logo_url: logoUrl });
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all profiles' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved all profiles.', type: [Profile] })
  async findAll(): Promise<Profile[]> {
    return this.profilesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a profile by ID' })
  @ApiParam({ name: 'id', description: 'ID of the profile to retrieve', type: Number })
  @ApiResponse({ status: 200, description: 'Successfully retrieved the profile.', type: Profile })
  @ApiResponse({ status: 404, description: 'Profile not found.' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Profile | null> {
    return this.profilesService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('logo'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        logo: {
          type: 'string',
          format: 'binary',
        },
        phones: {
          type: 'array',
          items: { type: 'string' },
          example: ['+1-202-555-0182'],
        },
        emails: {
          type: 'array',
          items: { type: 'string' },
          example: ['support@company.com'],
        },
        address: { type: 'string' },
        business_hours: {
          type: 'object',
          example: { type: '24/7' },
        },
      },
    },
  })
  @ApiOperation({ summary: 'Update a profile by ID with an optional logo upload' })
  @ApiParam({ name: 'id', description: 'ID of the profile to update', type: Number })
  @ApiResponse({ status: 200, description: 'The profile has been successfully updated.', type: Profile })
  @ApiResponse({ status: 404, description: 'Profile not found.' })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProfileDto: any,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<Profile> {
    let logoUrl: string | undefined;
    if (file) {
      logoUrl = await this.uploadService.uploadFile(file, 'logo');
    }

    // Parse JSON strings back to arrays for multipart form data
    const processedDto = { ...updateProfileDto };
    if (processedDto.phones && typeof processedDto.phones === 'string') {
      try {
        processedDto.phones = JSON.parse(processedDto.phones);
      } catch (e) {
        processedDto.phones = [];
      }
    }
    if (processedDto.emails && typeof processedDto.emails === 'string') {
      try {
        processedDto.emails = JSON.parse(processedDto.emails);
      } catch (e) {
        processedDto.emails = [];
      }
    }
    if (processedDto.business_hours && typeof processedDto.business_hours === 'string') {
      try {
        processedDto.business_hours = JSON.parse(processedDto.business_hours);
      } catch (e) {
        processedDto.business_hours = undefined;
      }
    }

    return this.profilesService.update(id, { ...processedDto, logo_url: logoUrl });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a profile by ID' })
  @ApiParam({ name: 'id', description: 'ID of the profile to delete', type: Number })
  @ApiResponse({ status: 200, description: 'The profile has been successfully deleted.', type: Profile })
  @ApiResponse({ status: 404, description: 'Profile not: Profile not found.' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<Profile> {
    return this.profilesService.remove(id);
  }
}
