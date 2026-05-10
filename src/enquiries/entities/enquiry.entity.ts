import { ApiProperty } from '@nestjs/swagger';
import { Enquiry as EnquiryModel, EnquiryStatus } from '@prisma/client';

export class Enquiry implements EnquiryModel {
  @ApiProperty({ description: 'Unique identifier for the enquiry' })
  id: number;

  @ApiProperty({ description: 'ID of the machine related to the enquiry' })
  machine_id: number;

  @ApiProperty({ description: 'Name of the user making the enquiry' })
  user_name: string;

  @ApiProperty({ description: 'Email of the user making the enquiry' })
  user_email: string;

  @ApiProperty({ description: 'Phone number of the user making the enquiry' })
  user_phone_number: string;

  @ApiProperty({ description: 'Message from the user', required: false })
  message: string | null;

  @ApiProperty({ description: 'Status of the enquiry', enum: ['pending', 'completed'], default: 'pending' })
  status: EnquiryStatus;

  @ApiProperty({ description: 'Timestamp of when the enquiry was created' })
  created_at: Date;

  @ApiProperty({ description: 'Timestamp of when the enquiry was last updated' })
  updated_at: Date;
}
