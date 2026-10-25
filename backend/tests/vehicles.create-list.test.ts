import request from 'supertest';
import { app } from '../src/app';
import { prisma } from '../src/lib/prisma';
import { bearer, createAuthenticatedUser } from './helpers/auth';
import { closeDatabase, resetDatabase } from '../src/helpers/db';
import { createVehicle, vehicleData } from './helpers/factories';

let adminToken: string;
let userToken: string;

beforeEach(async () => {
  await resetDatabase();
  adminToken = (await createAuthenticatedUser('ADMIN')).token;
  userToken = (await createAuthenticatedUser('USER')).token;
});
afterAll(closeDatabase);

describe('POST /api/vehicles', () => {
  it('returns 401 without a token', async () => {
    const res = await request(app).post('/api/vehicles').send(vehicleData());
    expect(res.status).toBe(401);
  });

  it('returns 403 for a regular user', async () => {
    const res = await request(app).post('/api/vehicles').set(bearer(userToken)).send(vehicleData());
    expect(res.status).toBe(403);
  });

  it('creates a vehicle for an admin and returns 201', async () => {
    const res = await request(app).post('/api/vehicles').set(bearer(adminToken)).send(vehicleData());

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ id: expect.any(String), ...vehicleData() });
    expect(await prisma.vehicle.count()).toBe(1);
  });

  it('defaults quantity to 0 when omitted', async () => {
    const { quantity: _omit, ...withoutQuantity } = vehicleData();
    const res = await request(app).post('/api/vehicles').set(bearer(adminToken)).send(withoutQuantity);

    expect(res.status).toBe(201);
    expect(res.body.quantity).toBe(0);
  });

  it.each([
    ['missing make', { make: undefined }],
    ['empty model', { model: '' }],
    ['zero price', { price: 0 }],
    ['negative price', { price: -1 }],
    ['decimal price', { price: 19999.99 }],
    ['string price', { price: 'cheap' }],
    ['negative quantity', { quantity: -1 }],
    ['fractional quantity', { quantity: 1.5 }],
  ])('returns 400 for %s', async (_label, override) => {
    const res = await request(app)
      .post('/api/vehicles')
      .set(bearer(adminToken))
      .send({ ...vehicleData(), ...(override as Record<string, unknown>) });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('GET /api/vehicles', () => {
  it('returns 401 without a token', async () => {
    expect((await request(app).get('/api/vehicles')).status).toBe(401);
  });

  it('lists only in-stock vehicles by default', async () => {
    await createVehicle({ model: 'In stock', quantity: 2 });
    await createVehicle({ model: 'Sold out', quantity: 0 });

    const res = await request(app).get('/api/vehicles').set(bearer(userToken));

    expect(res.status).toBe(200);
    expect(res.body.data.map((v: { model: string }) => v.model)).toEqual(['In stock']);
  });

  it('includes sold-out vehicles with includeOutOfStock=true', async () => {
    await createVehicle({ quantity: 2 });
    await createVehicle({ quantity: 0 });

    const res = await request(app).get('/api/vehicles?includeOutOfStock=true').set(bearer(userToken));

    expect(res.body.data).toHaveLength(2);
  });

  it('paginates results and reports totals', async () => {
    for (let i = 1; i <= 5; i++) await createVehicle({ model: `Model ${i}` });

    const res = await request(app).get('/api/vehicles?limit=2&page=3').set(bearer(userToken));

    expect(res.body.data).toHaveLength(1);
    expect(res.body.pagination).toEqual({ page: 3, limit: 2, total: 5, totalPages: 3 });
  });

  it('returns 400 for an out-of-range limit', async () => {
    const res = await request(app).get('/api/vehicles?limit=1000').set(bearer(userToken));
    expect(res.status).toBe(400);
  });
});