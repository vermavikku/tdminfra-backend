import { AuthMiddleware } from './auth.middleware';
import * as jwt from 'jsonwebtoken';

describe('AuthMiddleware', () => {
  const middleware = new AuthMiddleware();

  it('calls next for GET requests', () => {
    const req: any = { method: 'GET', path: '/enquiries', headers: {} };
    const res: any = {};
    const next = jest.fn();
    middleware.use(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('returns 401 if no token on protected methods', () => {
    const req: any = { method: 'POST', path: '/enquiries', headers: {} };
    const json = jest.fn();
    const status = jest.fn().mockReturnValue({ json });
    const res: any = { status };
    const next = jest.fn();
    middleware.use(req, res, next);
    expect(status).toHaveBeenCalledWith(401);
    expect(json).toHaveBeenCalledWith({ message: 'Unauthorized' });
    expect(next).not.toHaveBeenCalled();
  });

  it('calls next when token is valid', () => {
    const payload = { sub: 1, username: 'Admin' };
    const token = jwt.sign(payload as any, process.env.JWT_SECRET || 'default_jwt_secret');
    const req: any = { method: 'DELETE', path: '/machineries/1', headers: { authorization: `Bearer ${token}` } };
    const res: any = {};
    const next = jest.fn();
    middleware.use(req, res, next);
    expect(next).toHaveBeenCalled();
    expect((req as any).user).toBeTruthy();
  });

  it('skips auth for /auth routes', () => {
    const req: any = { method: 'POST', path: '/auth/login', headers: {} };
    const res: any = {};
    const next = jest.fn();
    middleware.use(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});
