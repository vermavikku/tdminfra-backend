import { ApiProperty } from '@nestjs/swagger';

export class AuthUserDto {
  @ApiProperty() id: number;
  @ApiProperty() username: string;
  @ApiProperty() created_at: Date;
}

export class AuthResponseDto {
  @ApiProperty() access_token: string;
  @ApiProperty({ type: AuthUserDto }) user: AuthUserDto;
}
