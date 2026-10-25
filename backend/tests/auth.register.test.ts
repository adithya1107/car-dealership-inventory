import request from 'supertest';
import { app } from '../src/app';
import { prisma } from '../src/lib/prisma';
import { closeDatabase, resetDatabase } from './helpers/db';

const validUser = { email: 'jane@example.com', password: 'Passw0rd!123' };

beforeEach(resetDatabase);
afterAll(closeDatabase);

describe('POST /api/auth/register', () => {
  it('creates a user and returns 201 without leaking the password hash', async () => {
    const res = await request(app).post('/api/auth/register').send(validUser);

    expect(res.status).toBe(201);
    expect(res.body.user).toEqual({
      id: expect.any(String),
      email: 'jane@example.com',
      role: 'USER',
    });
    expect(JSON.stringify(res.body)).not.toMatch(/password/i);
  });

  it('stores a hash, never the plain-text password', async () => {
    await request(app).post('/api/auth/register').send(validUser);

    const stored = await prisma.user.findUniqueOrThrow({
      where: { email: validUser.email },
    });
    expect(stored.passwordHash).not.toBe(validUser.password);
    expect(stored.passwordHash.length).toBeGreaterThan(20);
  });

  it('normalises the email to lower case', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validUser, email: '  Jane@Example.COM ' });

    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe('jane@example.com');
  });

  it('returns 409 when the email is already registered', async () => {
    await request(app).post('/api/auth/register').send(validUser);
    const res = await request(app).post('/api/auth/register').send(validUser);

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('EMAIL_ALREADY_REGISTERED');
  });

  it.each([
    ['invalid email', { email: 'not-an-email', password: 'Passw0rd!123' }],
    ['password too short', { email: 'a@b.com', password: 'short' }],
    ['missing password', { email: 'a@b.com' }],
    ['empty body', {}],
  ])('returns 400 for %s', async (_label, payload) => {
    const res = await request(app).post('/api/auth/register').send(payload);

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('ignores a client-supplied role (no self-promotion to admin)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validUser, role: 'ADMIN' });

    expect(res.status).toBe(201);
    expect(res.body.user.role).toBe('USER');
    const stored = await prisma.user.findUniqueOrThrow({
      where: { email: validUser.email },
    });
    expect(stored.role).toBe('USER');
  });
});