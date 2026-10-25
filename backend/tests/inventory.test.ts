import request from 'supertest';
import { app } from '../src/app';
import { prisma } from '../src/lib/prisma';
import { bearer, createAuthenticatedUser } from './helpers/auth';
import { closeDatabase, resetDatabase } from '../src/helpers/db';
import { createVehicle } from './helpers/factories';

let adminToken: string;
let userToken: string;

const stockOf = async (id: string) =>
  (await prisma.vehicle.findUniqueOrThrow({ where: { id } })).quantity;

beforeEach(async () => {
  await resetDatabase();
  adminToken = (await createAuthenticatedUser('ADMIN')).token;
  userToken = (await createAuthenticatedUser('USER')).token;
});
afterAll(closeDatabase);

describe('POST /api/vehicles/:id/purchase', () => {
  it('returns 401 without a token', async () => {
    const v = await createVehicle();
    expect((await request(app).post(`/api/vehicles/${v.id}/purchase`)).status).toBe(401);
  });

  it('decreases stock by 1 when no body is sent', async () => {
    const v = await createVehicle({ quantity: 5 });
    const res = await request(app).post(`/api/vehicles/${v.id}/purchase`).set(bearer(userToken));

    expect(res.status).toBe(200);
    expect(res.body.quantity).toBe(4);
    expect(await stockOf(v.id)).toBe(4);
  });

  it('decreases stock by the requested quantity', async () => {
    const v = await createVehicle({ quantity: 5 });
    const res = await request(app)
      .post(`/api/vehicles/${v.id}/purchase`)
      .set(bearer(userToken))
      .send({ quantity: 3 });

    expect(res.status).toBe(200);
    expect(await stockOf(v.id)).toBe(2);
  });

  it('returns 409 OUT_OF_STOCK at zero stock and never goes negative', async () => {
    const v = await createVehicle({ quantity: 0 });
    const res = await request(app).post(`/api/vehicles/${v.id}/purchase`).set(bearer(userToken));

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('OUT_OF_STOCK');
    expect(await stockOf(v.id)).toBe(0);
  });

  it('returns 409 when asking for more than is in stock, leaving stock untouched', async () => {
    const v = await createVehicle({ quantity: 2 });
    const res = await request(app)
      .post(`/api/vehicles/${v.id}/purchase`)
      .set(bearer(userToken))
      .send({ quantity: 3 });

    expect(res.status).toBe(409);
    expect(await stockOf(v.id)).toBe(2);
  });

  it('returns 404 for an unknown vehicle', async () => {
    const res = await request(app).post('/api/vehicles/does-not-exist/purchase').set(bearer(userToken));
    expect(res.status).toBe(404);
  });

  it.each([[0], [-1], [1.5], ['abc']])('returns 400 for quantity %p', async (quantity) => {
    const v = await createVehicle({ quantity: 5 });
    const res = await request(app)
      .post(`/api/vehicles/${v.id}/purchase`)
      .set(bearer(userToken))
      .send({ quantity });

    expect(res.status).toBe(400);
    expect(await stockOf(v.id)).toBe(5);
  });
});

describe('POST /api/vehicles/:id/restock', () => {
  it('returns 401 without a token', async () => {
    const v = await createVehicle();
    expect((await request(app).post(`/api/vehicles/${v.id}/restock`).send({ quantity: 1 })).status).toBe(401);
  });

  it('returns 403 for a regular user', async () => {
    const v = await createVehicle({ quantity: 1 });
    const res = await request(app)
      .post(`/api/vehicles/${v.id}/restock`)
      .set(bearer(userToken))
      .send({ quantity: 10 });

    expect(res.status).toBe(403);
    expect(await stockOf(v.id)).toBe(1);
  });

  it('increases stock for an admin', async () => {
    const v = await createVehicle({ quantity: 1 });
    const res = await request(app)
      .post(`/api/vehicles/${v.id}/restock`)
      .set(bearer(adminToken))
      .send({ quantity: 10 });

    expect(res.status).toBe(200);
    expect(res.body.quantity).toBe(11);
  });

  it.each([[{}], [{ quantity: 0 }], [{ quantity: -5 }], [{ quantity: 1.5 }]])(
    'returns 400 for invalid payload %j',
    async (payload) => {
      const v = await createVehicle({ quantity: 1 });
      const res = await request(app).post(`/api/vehicles/${v.id}/restock`).set(bearer(adminToken)).send(payload);
      expect(res.status).toBe(400);
    },
  );

  it('returns 404 for an unknown vehicle', async () => {
    const res = await request(app)
      .post('/api/vehicles/does-not-exist/restock')
      .set(bearer(adminToken))
      .send({ quantity: 5 });
    expect(res.status).toBe(404);
  });
});