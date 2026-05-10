import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  it('login returns token and user when credentials valid', async () => {
    const password = 'password123';
    const hashed = await bcrypt.hash(password, 10);
    const fakePrisma: any = {
      user: { findUnique: jest.fn().mockResolvedValue({ id: 1, username: 'admin', password: hashed, created_at: new Date() }), update: jest.fn() },
    };

    const svc = new AuthService(fakePrisma as any);
    const res = await svc.login({ username: 'admin', password });
    expect(res).toHaveProperty('access_token');
    expect(res.user.username).toBe('admin');
  });

  it('resetPassword updates the user password', async () => {
    const fakePrisma: any = {
      user: {
        findUnique: jest.fn().mockResolvedValue({ id: 2, username: 'bob', password: 'old' }),
        update: jest.fn().mockImplementation(({ where, data }) => Promise.resolve({ id: 2, username: 'bob', password: data.password })),
      },
    };

    const svc = new AuthService(fakePrisma as any);
    const res = await svc.resetPassword({ username: 'bob', new_password: 'newpassword' });
    expect(res).toHaveProperty('message', 'Password updated');
    expect(res.user.username).toBe('bob');
  });
});
