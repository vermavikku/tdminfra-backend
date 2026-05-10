import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EnquiryStatus, toPrismaEnquiryStatus } from '../common/enums/statuses';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getSummary() {
    const [totalMachineries, totalEnquiries, pendingEnquiries, completedEnquiries] = await Promise.all([
      this.prisma.machinery.count(),
      this.prisma.enquiry.count(),
      this.prisma.enquiry.count({ where: { status: toPrismaEnquiryStatus(EnquiryStatus.PENDING) } }),
      this.prisma.enquiry.count({ where: { status: toPrismaEnquiryStatus(EnquiryStatus.COMPLETED) } }),
    ]);

    return {
      totalMachineries,
      totalEnquiries,
      pendingEnquiries,
      completedEnquiries,
    };
  }
}
