import express from 'express';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import { signToken } from '../src/lib/token';
import { authenticate } from '../src/middleware/authenticate';
import { errorHandler } from '../src/middleware/errorHandler';
import { requireRole } from '../src/middleware/requireRole';

const testApp = express();
testApp.get('/protected', authenticate, (_req, res) => {
  res.json({ user: res.locals.user });
});
testApp.get('/admin', authenticate, requireRole('ADMIN'), (_req, res) => {
  res.json({ ok: true });
});
testApp.use(errorHandler);

const userToken = signToken({ sub: 'u1', role: 'USER' });
const adminToken = signToken({ sub: 'a1', role: 'ADMIN' });

describe('authenticate', () => {
  it('rejects requests without an Authorization header', async () => {
    const res = await request(testApp).get('/protected');
    expect(res.status).toBe(401);
  });

  it('rejects a non-Bearer scheme', async () => {
    const res = await request(testApp).get('/protected').set('Authorization', `Basic ${userToken}`);
    expect(res.status).toBe(401);
  });

  it('rejects a garbage token', async () => {
    const res = await request(testApp).get('/protected').set('Authorization', 'Bearer not.a.jwt');
    expect(res.status).toBe(401);
  });

  it('rejects a token signed with a different secret', async () => {
    const forged = jwt.sign({ sub: 'u1', role: 'ADMIN' }, 'some-other-secret');
    const res = await request(testApp).get('/protected').set('Authorization', `Bearer ${forged}`);
    expect(res.status).toBe(401);
  });

  it('rejects an expired token', async () => {
    const expired = jwt.sign({ sub: 'u1', role: 'USER' }, process.env.JWT_SECRET!, { expiresIn: -10 });
    const res = await request(testApp).get('/protected').set('Authorization', `Bearer ${expired}`);
    expect(res.status).toBe(401);
  });

  it('accepts a valid token and exposes the user to handlers', async () => {
    const res = await request(testApp).get('/protected').set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(res.body.user).toEqual({ id: 'u1', role: 'USER' });
  });
});

describe('requireRole("ADMIN")', () => {
  it('returns 401 when unauthenticated', async () => {
    const res = await request(testApp).get('/admin');
    expect(res.status).toBe(401);
  });

  it('returns 403 for a regular user', async () => {
    const res = await request(testApp).get('/admin').set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('allows an admin', async () => {
    const res = await request(testApp).get('/admin').set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
  });
});