import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { MachineryStatus, MACHINERY_STATUS_VALUES } from '../../common/enums/statuses';

export class QueryMachineryDto {
  @ApiProperty({ description: 'Page number for pagination', required: false, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ description: 'Number of items per page', required: false, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiProperty({ description: 'Filter machineries by title (case-insensitive)', required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ description: 'Filter machineries by category code', required: false })
  @IsOptional()
  @IsString()
  category_code?: string;

  @ApiProperty({ description: 'Filter machineries by status', required: false, enum: MACHINERY_STATUS_VALUES })
  @IsOptional()
  @IsEnum(MachineryStatus)
  status?: MachineryStatus;
}
