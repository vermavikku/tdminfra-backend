import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async login(dto: LoginDto) {
    if (!dto || !dto.username || !dto.password) {
      throw new UnauthorizedException('Username and password are required');
    }

    const user = await this.prisma.user.findUnique({ where: { username: dto.username } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(dto.password, user.password);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    const token = jwt.sign(
      { sub: user.id, username: user.username },
      process.env.JWT_SECRET || 'default_jwt_secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' },
    );

    // return token and basic user info (omit password)
    const { password, ...safeUser } = user as any;
    return { access_token: token, user: safeUser };
  }

  async resetPassword(userId: number, dto: ResetPasswordDto) {
    // Get user by ID
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    // Verify old password
    const ok = await bcrypt.compare(dto.old_password, user.password);
    if (!ok) throw new UnauthorizedException('Current password is incorrect');

    // Hash new password
    const hashed = await bcrypt.hash(dto.new_password, 10);
    const updated = await this.prisma.user.update({ where: { id: user.id }, data: { password: hashed } });
    const { password, ...safe } = updated as any;
    return { message: 'Password updated', user: safe };
  }

  async verifyToken(token: string) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_jwt_secret') as any;
      return { userId: decoded.sub, username: decoded.username };
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
