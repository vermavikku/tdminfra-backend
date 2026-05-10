import { ApiProperty } from '@nestjs/swagger';

export interface CategoryRecord {
  id: number;
  name: string;
  code: string;
  created_at: Date;
  updated_at: Date;
}

export class Category implements CategoryRecord {
  @ApiProperty({ description: 'Unique category identifier' })
  id: number;

  @ApiProperty({ description: 'Category name' })
  name: string;

  @ApiProperty({ description: 'Unique category code' })
  code: string;

  @ApiProperty({ description: 'Creation timestamp' })
  created_at: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updated_at: Date;
}
