import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsNotEmpty, IsOptional, IsInt, IsEnum } from 'class-validator';
import { EnquiryStatus, ENQUIRY_STATUS_VALUES } from '../../common/enums/statuses';

export class CreateEnquiryDto {
  @ApiProperty({ description: 'The ID of the machine related to the enquiry', required: false })
  @IsInt()
  @IsOptional()
  machine_id?: number;

  @ApiProperty({ description: 'The ID of the machinery related to the enquiry (alternative to machine_id)' })
  @IsInt()
  @IsOptional()
  machinery_id?: number;

  @ApiProperty({ description: 'Name of the user making the enquiry' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Email of the user making the enquiry' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'Phone number of the user making the enquiry' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ description: 'Type of machine being enquired about' })
  @IsString()
  @IsOptional()
  machine_type?: string;

  @ApiProperty({ description: 'Message from the user', required: false })
  @IsString()
  @IsOptional()
  message?: string;

  @ApiProperty({ description: 'Status of the enquiry', required: false, enum: ENQUIRY_STATUS_VALUES, default: EnquiryStatus.PENDING })
  @IsOptional()
  @IsEnum(EnquiryStatus)
  status?: EnquiryStatus;
}
