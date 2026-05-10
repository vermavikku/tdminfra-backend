import { ApiProperty } from '@nestjs/swagger';
import { User as PrismaUser } from '@prisma/client';

export class User implements PrismaUser {
  @ApiProperty({ description: 'The unique identifier of the user' })
  id: number;

  @ApiProperty({ description: 'The unique username of the user' })
  username: string;

  // Password should not be exposed via API, so we omit ApiProperty for it
  password: string;

  @ApiProperty({ description: 'The date and time when the user was created' })
  created_at: Date;

  @ApiProperty({ description: 'The date and time when the user was last updated' })
  updated_at: Date;
}
