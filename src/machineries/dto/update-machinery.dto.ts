import { PartialType } from '@nestjs/swagger';
import { CreateMachineryDto } from './create-machinery.dto';

export class UpdateMachineryDto extends PartialType(CreateMachineryDto) {}
