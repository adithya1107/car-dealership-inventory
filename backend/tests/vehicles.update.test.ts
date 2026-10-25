import request from 'supertest';
import { app } from '../src/app';
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

describe('PUT /api/vehicles/:id', () => {
  it('returns 401 without a token', async () => {
    const v = await createVehicle();
    expect((await request(app).put(`/api/vehicles/${v.id}`).send({ price: 1 })).status).toBe(401);
  });

  it('returns 403 for a regular user', async () => {
    const v = await createVehicle();
    const res = await request(app).put(`/api/vehicles/${v.id}`).set(bearer(userToken)).send({ price: 1000 });
    expect(res.status).toBe(403);
  });

  it('updates only the supplied fields', async () => {
    const v = await createVehicle({ price: 2_000_000, quantity: 7 });

    const res = await request(app)
      .put(`/api/vehicles/${v.id}`)
      .set(bearer(adminToken))
      .send({ price: 2_100_000, category: 'Hatchback' });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      id: v.id,
      price: 2_100_000,
      category: 'Hatchback',
      make: v.make, // untouched
      quantity: 7, // untouched
    });
  });

  it('returns 404 for an unknown vehicle', async () => {
    const res = await request(app).put('/api/vehicles/does-not-exist').set(bearer(adminToken)).send({ price: 1000 });
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it.each([
    ['empty body', {}],
    ['negative price', { price: -5 }],
    ['blank make', { make: '   ' }],
    ['fractional quantity', { quantity: 2.5 }],
  ])('returns 400 for %s', async (_label, payload) => {
    const v = await createVehicle();
    const res = await request(app).put(`/api/vehicles/${v.id}`).set(bearer(adminToken)).send(payload);
    expect(res.status).toBe(400);
  });
});