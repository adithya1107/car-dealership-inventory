import { RequestHandler } from 'express';
import { ForbiddenError, UnauthorizedError } from '../errors/AppError';
import { Role } from '../modules/auth/roles';
import { AuthUser } from './authenticate';

/** Authorization guard. Must run after `authenticate`. */
export const requireRole =
  (role: Role): RequestHandler =>
  (_req, res, next) => {
    const user = res.locals.user as AuthUser | undefined;
    if (!user) return next(new UnauthorizedError());
    if (user.role !== role) return next(new ForbiddenError());
    next();
  };