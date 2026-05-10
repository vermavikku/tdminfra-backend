import { Module } from '@nestjs/common';
import { MachineriesService } from './machineries.service';
import { MachineriesController } from './machineries.controller';
import { MachineryDropdownController } from './machinery-dropdown.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { S3Module } from '../common/s3/s3.module';

@Module({
  imports: [PrismaModule, S3Module],
  controllers: [MachineriesController, MachineryDropdownController],
  providers: [MachineriesService],
})
export class MachineriesModule {}
