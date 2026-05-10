import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEnquiryDto } from './dto/create-enquiry.dto';
import { UpdateEnquiryDto } from './dto/update-enquiry.dto';
import { Enquiry } from '@prisma/client';
import { EnquiryStatus, toPrismaEnquiryStatus } from '../common/enums/statuses';
import { MailService } from '../mail/mail.service';

@Injectable()
export class EnquiriesService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  async create(createEnquiryDto: CreateEnquiryDto): Promise<Enquiry> {
    // Ensure we have a valid machine_id
    const machineId = createEnquiryDto.machine_id || createEnquiryDto.machinery_id;
    if (!machineId) {
      throw new BadRequestException('Machine ID is required');
    }

    const data = {
      machine_id: machineId,
      user_name: createEnquiryDto.name,
      user_email: createEnquiryDto.email,
      user_phone_number: createEnquiryDto.phone,
      message: createEnquiryDto.message,
      status: createEnquiryDto.status ? toPrismaEnquiryStatus(createEnquiryDto.status) : undefined,
    };
    const enquiry = await this.prisma.enquiry.create({
      data,
    });

    try {
      const machinery = await this.prisma.machinery.findUnique({
        where: { id: enquiry.machine_id },
        select: { title: true },
      });
      const subjectLine =
        machinery?.title?.trim() ||
        createEnquiryDto.machine_type?.trim() ||
        'Machinery enquiry';
      await this.mailService.sendContactEmail({
        name: createEnquiryDto.name,
        email: createEnquiryDto.email,
        phone: createEnquiryDto.phone,
        subject: subjectLine,
        message: createEnquiryDto.message?.trim() || '—',
      });
    } catch (err) {
      console.error('Enquiry notification email failed (enquiry still saved):', err);
    }

    return enquiry;
  }

  async findAll(params: { page?: number; limit?: number; status?: EnquiryStatus } = {}): Promise<{ data: any[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 10, status } = params;
    const skip = (page - 1) * limit;
    
    const where: any = {};
    if (status) {
      where.status = toPrismaEnquiryStatus(status as any);
    }

    // Get enquiries with pagination
    const enquiries = await this.prisma.enquiry.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        created_at: 'desc'
      }
    });

    // Get machinery IDs from enquiries
    const machineryIds = enquiries.map(e => e.machine_id).filter(id => id);
    
    // Get machinery data separately
    const machineries = await this.prisma.machinery.findMany({
      where: {
        id: {
          in: machineryIds,
        },
      },
      select: {
        id: true,
        title: true,
      },
    });

    // Create a map of machinery ID to title
    const machineryMap = machineries.reduce((acc, m) => {
      acc[m.id] = m.title;
      return acc;
    }, {} as Record<number, string>);

    // Get total count for pagination
    const total = await this.prisma.enquiry.count({ where });

    // Combine the data
    const data = enquiries.map(enquiry => ({
      ...enquiry,
      machinery_title: machineryMap[enquiry.machine_id] || 'Unknown',
    }));

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async getRecent(limit: number = 5): Promise<any[]> {
    const enquiries = await this.prisma.enquiry.findMany({
      take: limit,
      orderBy: { created_at: 'desc' },
    });

    // Get machinery titles for the enquiries
    const machineryIds = enquiries.map(e => e.machine_id).filter(id => id);
    const machineries = await this.prisma.machinery.findMany({
      where: {
        id: {
          in: machineryIds,
        },
      },
      select: {
        id: true,
        title: true,
      },
    });

    const machineryMap = machineries.reduce((acc, m) => {
      acc[m.id] = m.title;
      return acc;
    }, {} as Record<number, string>);

    return enquiries.map(enquiry => ({
      id: enquiry.id,
      name: enquiry.user_name,
      product: machineryMap[enquiry.machine_id] || 'Unknown',
      date: this.formatRelativeTime(enquiry.created_at),
      status: this.formatStatus(enquiry.status),
    }));
  }

  async getChartData(months: number = 6): Promise<{ name: string; enquiries: number }[]> {
    const now = new Date();
    const chartData: { name: string; enquiries: number }[] = [];

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

      const count = await this.prisma.enquiry.count({
        where: {
          created_at: {
            gte: date,
            lt: nextMonth,
          },
        },
      });

      chartData.push({
        name: date.toLocaleDateString('en-US', { month: 'short' }),
        enquiries: count,
      });
    }

    return chartData;
  }

  async findOne(id: number): Promise<Enquiry | null> {
    const enquiry = await this.prisma.enquiry.findUnique({
      where: { id },
    });
    if (!enquiry) {
      throw new NotFoundException(`Enquiry with ID ${id} not found`);
    }
    return enquiry;
  }

  async update(id: number, updateEnquiryDto: UpdateEnquiryDto): Promise<Enquiry> {
    try {
      const data = {
        ...updateEnquiryDto,
        status: updateEnquiryDto.status ? toPrismaEnquiryStatus(updateEnquiryDto.status as any) : undefined,
      };
      return await this.prisma.enquiry.update({
        where: { id },
        data,
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Enquiry with ID ${id} not found`);
      }
      throw error;
    }
  }

  async remove(id: number): Promise<Enquiry> {
    try {
      return await this.prisma.enquiry.delete({
        where: { id },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Enquiry with ID ${id} not found`);
      }
      throw error;
    }
  }

  private formatRelativeTime(date: Date): string {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  }

  private formatStatus(status: string): string {
    const statusMap: { [key: string]: string } = {
      'PENDING': 'Pending',
      'COMPLETED': 'Completed',
    };
    return statusMap[status] || status;
  }
}
