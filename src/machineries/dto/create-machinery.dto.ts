import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString, IsNotEmpty, IsOptional, IsUrl, IsEnum, MaxLength } from 'class-validator';
import { MachineryStatus, MACHINERY_STATUS_VALUES } from '../../common/enums/statuses';

export class CreateMachineryDto {
  @ApiProperty({ description: 'The title of the machinery' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiProperty({ description: 'The machinery description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'The category code for the machinery' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toUpperCase() : value))
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  category_code: string;

  @ApiProperty({ description: 'The URL of the machinery image', required: false })
  @IsOptional()
  @IsString()
  @IsUrl()
  image_url?: string;

  @ApiProperty({ description: 'Status of the machinery', required: false, enum: MACHINERY_STATUS_VALUES, default: MachineryStatus.ACTIVE })
  @IsOptional()
  @IsEnum(MachineryStatus)
  status?: MachineryStatus;
}
