import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, IsJSON, IsUrl } from 'class-validator';

export class CreateProfileDto {
  @ApiProperty({ description: 'The URL of the business logo' })
  @IsOptional()
  @IsString()
  @IsUrl()
  logo_url?: string;

  @ApiProperty({
    description: 'Multiple phone numbers for the business',
    type: [String],
    example: ['+1-202-555-0182', '+1-202-555-0123'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  phones?: string[];

  @ApiProperty({
    description: 'Multiple email addresses for the business',
    type: [String],
    example: ['support@company.com', 'info@company.com'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  emails?: string[];

  @ApiProperty({ description: 'The address of the business' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({
    description: 'Business hours in JSON format (e.g., {"type":"24/7"} or {"monday":"9-5"})',
    type: 'object',
    example: { type: '24/7' },
    additionalProperties: true,
  })
  @IsOptional()
  business_hours?: object; // Use object for JSON type
}
