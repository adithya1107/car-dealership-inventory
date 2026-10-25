import jwt, { SignOptions } from 'jsonwebtoken';
import { jwtConfig } from '../config/env';
import { Role } from '../modules/auth/roles';

export interface TokenPayload {
  sub: string; // user id
  role: Role;
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, jwtConfig.secret, {
    algorithm: 'HS256',
    expiresIn: jwtConfig.expiresIn as SignOptions['expiresIn'],
  });
}

/** Throws if the token is invalid, expired, or has an unexpected shape. */
export function verifyToken(token: string): TokenPayload {
  const decoded = jwt.verify(token, jwtConfig.secret, { algorithms: ['HS256'] });
  if (typeof decoded === 'string' || typeof decoded.sub !== 'string' || typeof decoded.role !== 'string') {
    throw new Error('Malformed token payload');
  }
  return { sub: decoded.sub, role: decoded.role as Role };
}