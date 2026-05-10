import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const method = req.method.toUpperCase();
    // Only protect POST, PUT, DELETE
    if (!['POST', 'PUT', 'DELETE'].includes(method)) {
      return next();
    }

    // Allow unauthenticated access to auth routes (login/reset)
    if (req.path && req.path.startsWith('/auth')) return next();

    // Allow unauthenticated access to enquiries POST (for public form submissions)
    if (method === 'POST' && req.path && req.path.startsWith('/enquiries')) return next();

    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    if (!authHeader || typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const token = authHeader.slice(7);
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET || 'default_jwt_secret');
      // attach user payload for downstream handlers
      (req as any).user = payload;
      return next();
    } catch (err) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
  }
}
