import { RequestHandler } from 'express';
import { UnauthorizedError } from '../errors/AppError';
import { verifyToken } from '../lib/token';
import { Role } from '../modules/auth/roles';

export interface AuthUser {
  id: string;
  role: Role;
}

/** Verifies the Bearer token and exposes the caller as res.locals.user. */
export const authenticate: RequestHandler = (req, res, next) => {
  const [scheme, token] = req.header('Authorization')?.split(' ') ?? [];
  if (scheme !== 'Bearer' || !token) {
    return next(new UnauthorizedError('Missing or malformed Authorization header'));
  }

  try {
    const payload = verifyToken(token);
    res.locals.user = { id: payload.sub, role: payload.role } satisfies AuthUser;
    next();
  } catch {
    next(new UnauthorizedError('Invalid or expired token'));
  }
};