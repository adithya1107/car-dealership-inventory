import request from 'supertest';
import { app } from '../src/app';
import { prisma } from '../src/lib/prisma';
import { bearer, createAuthenticatedUser } from './helpers/auth';
import { closeDatabase, resetDatabase } from '../src/helpers/db';
import { createVehicle } from './helpers/factories';

let adminToken: string;
let userToken: string;

beforeEach(async () => {
  await resetDatabase();
  adminToken = (await createAuthenticatedUser('ADMIN')).token;
  userToken = (await createAuthenticatedUser('USER')).token;
});
afterAll(closeDatabase);

describe('DELETE /api/vehicles/:id', () => {
  it('returns 401 without a token', async () => {
    const v = await createVehicle();
    expect((await request(app).delete(`/api/vehicles/${v.id}`)).status).toBe(401);
  });

  it('returns 403 for a regular user and keeps the vehicle', async () => {
    const v = await createVehicle();
    const res = await request(app).delete(`/api/vehicles/${v.id}`).set(bearer(userToken));

    expect(res.status).toBe(403);
    expect(await prisma.vehicle.count()).toBe(1);
  });

  it('deletes the vehicle for an admin and returns 204', async () => {
    const v = await createVehicle();
    const res = await request(app).delete(`/api/vehicles/${v.id}`).set(bearer(adminToken));

    expect(res.status).toBe(204);
    expect(await prisma.vehicle.findUnique({ where: { id: v.id } })).toBeNull();
  });

  it('returns 404 for an unknown vehicle', async () => {
    const res = await request(app).delete('/api/vehicles/does-not-exist').set(bearer(adminToken));
    expect(res.status).toBe(404);
  });
});