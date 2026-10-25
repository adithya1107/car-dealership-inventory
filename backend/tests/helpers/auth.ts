import request from 'supertest';
import { app } from '../../src/app';
import { prisma } from '../../src/lib/prisma';

let counter = 0;

/** Registers + logs in a real user through the API; promotes to ADMIN directly in the DB. */
export async function createAuthenticatedUser(role: 'USER' | 'ADMIN' = 'USER') {
  const email = `${role.toLowerCase()}${++counter}@example.com`;
  const password = 'Passw0rd!123';

  await request(app).post('/api/auth/register').send({ email, password });
  if (role === 'ADMIN') {
    await prisma.user.update({ where: { email }, data: { role: 'ADMIN' } });
  }
  const res = await request(app).post('/api/auth/login').send({ email, password });
  return { token: res.body.token as string, user: res.body.user };
}

export const bearer = (token: string) => ({ Authorization: `Bearer ${token}` });