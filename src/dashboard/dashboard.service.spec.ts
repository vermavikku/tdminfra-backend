import { DashboardService } from './dashboard.service';

describe('DashboardService', () => {
  it('returns counts from prisma', async () => {
    const fakePrisma: any = {
      machinery: { count: jest.fn().mockResolvedValue(5) },
      enquiry: { count: jest.fn().mockImplementation(({ where } = {}) => {
        if (where?.status === 'PENDING') return Promise.resolve(2);
        if (where?.status === 'COMPLETED') return Promise.resolve(3);
        return Promise.resolve(7);
      }) },
    };

    const svc = new DashboardService(fakePrisma as any);
    const res = await svc.getSummary();
    expect(res).toEqual({
      totalMachineries: 5,
      totalEnquiries: 7,
      pendingEnquiries: 2,
      completedEnquiries: 3,
    });
  });
});
