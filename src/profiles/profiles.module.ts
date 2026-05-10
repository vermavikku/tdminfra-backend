import { Module } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { ProfilesController } from './profiles.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { S3Module } from '../common/s3/s3.module';

@Module({
  imports: [PrismaModule, S3Module],
  controllers: [ProfilesController],
  providers: [ProfilesService],
})
export class ProfilesModule {}
