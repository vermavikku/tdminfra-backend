import { ApiProperty } from '@nestjs/swagger';

export interface MachineryRecord {
  id: number;
  title: string;
  description: string | null;
  category_code: string;
  image_url: string | null;
  status: string;
  created_at: Date;
  updated_at: Date;
}

export class Machinery implements MachineryRecord {
  @ApiProperty({ description: 'The unique identifier of the machinery' })
  id: number;

  @ApiProperty({ description: 'The title of the machinery' })
  title: string;

  @ApiProperty({ description: 'The machinery description', required: false })
  description: string | null;

  @ApiProperty({ description: 'The category code of the machinery' })
  category_code: string;

  @ApiProperty({ description: 'The URL of the machinery image', required: false })
  image_url: string | null;

  @ApiProperty({ description: 'Status of the machinery', enum: ['active', 'inactive'], default: 'active' })
  status: string;

  @ApiProperty({ description: 'The date and time when the machinery was created' })
  created_at: Date;

  @ApiProperty({ description: 'The date and time when the machinery was last updated' })
  updated_at: Date;
}
