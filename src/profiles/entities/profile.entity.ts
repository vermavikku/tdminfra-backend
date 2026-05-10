import { ApiProperty } from '@nestjs/swagger';
import { Profile as PrismaProfile, Prisma } from '@prisma/client';

export class Profile implements PrismaProfile {
  @ApiProperty({ description: 'The unique identifier of the profile' })
  id: number;

  @ApiProperty({ description: 'The URL of the business logo' })
  logo_url: string | null;

  @ApiProperty({
    description: 'Multiple phone numbers for the business',
    type: [String],
    example: ['+1-202-555-0182', '+1-202-555-0123'],
  })
  phones: string[];

  @ApiProperty({
    description: 'Multiple email addresses for the business',
    type: [String],
    example: ['support@company.com', 'info@company.com'],
  })
  emails: string[];

  @ApiProperty({ description: 'The address of the business' })
  address: string | null;

  @ApiProperty({
    description: 'Business hours in JSON format (e.g., {"type":"24/7"} or {"monday":"9-5"})',
    type: 'object',
    example: { type: '24/7' },
    additionalProperties: true,
  })
  business_hours: Prisma.JsonValue;

  @ApiProperty({ description: 'The date and time when the profile was created' })
  created_at: Date;

  @ApiProperty({ description: 'The date and time when the profile was last updated' })
  updated_at: Date;
}
