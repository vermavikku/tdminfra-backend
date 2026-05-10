import { DashboardController } from './dashboard.controller';

describe('DashboardController', () => {
  it('returns summary from service', async () => {
    const fakeService: any = { getSummary: jest.fn().mockResolvedValue({ totalMachineries: 1, totalEnquiries: 2, pendingEnquiries: 1, completedEnquiries: 1 }) };
    const ctrl = new DashboardController(fakeService as any);
    const res = await ctrl.getSummary();
    expect(res).toEqual({ totalMachineries: 1, totalEnquiries: 2, pendingEnquiries: 1, completedEnquiries: 1 });
  });
});
