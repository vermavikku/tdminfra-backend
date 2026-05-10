import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Profile } from '@prisma/client';

@Injectable()
export class ProfilesService {
  constructor(private prisma: PrismaService) {}

  async create(createProfileDto: CreateProfileDto): Promise<Profile> {
    return this.prisma.profile.create({
      data: {
        ...createProfileDto,
        business_hours: createProfileDto.business_hours ? JSON.stringify(createProfileDto.business_hours) : '{}',
      },
    });
  }

  async findAll(): Promise<Profile[]> {
    return this.prisma.profile.findMany();
  }

  async findOne(id: number): Promise<Profile | null> {
    const profile = await this.prisma.profile.findUnique({
      where: { id },
    });
    if (!profile) {
      throw new NotFoundException(`Profile with ID ${id} not found`);
    }
    return profile;
  }

  async update(id: number, updateProfileDto: UpdateProfileDto): Promise<Profile> {
    try {
      return await this.prisma.profile.update({
        where: { id },
        data: {
          ...updateProfileDto,
          business_hours: updateProfileDto.business_hours ? JSON.stringify(updateProfileDto.business_hours) : undefined,
        },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Profile with ID ${id} not found`);
      }
      throw error;
    }
  }

  async remove(id: number): Promise<Profile> {
    try {
      return await this.prisma.profile.delete({
        where: { id },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Profile with ID ${id} not found`);
      }
      throw error;
    }
  }
}
