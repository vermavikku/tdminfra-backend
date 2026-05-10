import { Body, Controller, HttpCode, Post, UseGuards, Req } from '@nestjs/common';
import { ApiOkResponse, ApiTags, ApiUnauthorizedResponse, ApiNotFoundResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  @ApiOkResponse({ description: 'User authenticated and token returned', type: AuthResponseDto })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('reset-password')
  @UseGuards(JwtAuthGuard)
  @ApiUnauthorizedResponse({ description: 'Invalid or missing token' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiOkResponse({ description: 'Password updated' })
  async resetPassword(@Req() req: any, @Body() dto: ResetPasswordDto) {
    const userId = req.user.userId;
    return this.authService.resetPassword(userId, dto);
  }
}
