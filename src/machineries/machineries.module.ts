import { Module } from '@nestjs/common';
import { MachineriesService } from './machineries.service';
import { MachineriesController } from './machineries.controller';
import { MachineryDropdownController } from './machinery-dropdown.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { UploadModule } from '../common/upload/upload.module';

@Module({
  imports: [PrismaModule, UploadModule],
  controllers: [MachineriesController, MachineryDropdownController],
  providers: [MachineriesService],
})
export class MachineriesModule {}
