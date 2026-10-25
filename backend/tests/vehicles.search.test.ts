import request from 'supertest';
import { app } from '../src/app';
import { bearer, createAuthenticatedUser } from './helpers/auth';
import { closeDatabase, resetDatabase } from './helpers/db';
import { createVehicle } from './helpers/factories';

let token: string;

/** Runs a search and returns the matching model names, sorted. */
async function searchModels(query: string): Promise<string[]> {
  const res = await request(app).get(`/api/vehicles/search?${query}`).set(bearer(token));
  expect(res.status).toBe(200);
  return res.body.data.map((v: { model: string }) => v.model).sort();
}

beforeEach(async () => {
  await resetDatabase();
  token = (await createAuthenticatedUser('USER')).token;
  await createVehicle({ make: 'Toyota', model: 'Corolla', category: 'Sedan', price: 2_400_000, quantity: 3 });
  await createVehicle({ make: 'Toyota', model: 'RAV4', category: 'SUV', price: 3_500_000, quantity: 2 });
  await createVehicle({ make: 'Honda', model: 'Civic', category: 'Sedan', price: 2_600_000, quantity: 1 });
  await createVehicle({ make: 'Ford', model: 'F-150', category: 'Truck', price: 4_500_000, quantity: 4 });
  await createVehicle({ make: 'Tesla', model: 'Model 3', category: 'Electric', price: 4_000_000, quantity: 0 });
});
afterAll(closeDatabase);

describe('GET /api/vehicles/search', () => {
  it('returns 401 without a token', async () => {
    expect((await request(app).get('/api/vehicles/search?make=toyota')).status).toBe(401);
  });

  it('filters by make (case-insensitive, partial)', async () => {
    expect(await searchModels('make=TOY')).toEqual(['Corolla', 'RAV4']);
  });

  it('filters by model', async () => {
    expect(await searchModels('model=civ')).toEqual(['Civic']);
  });

  it('filters by category', async () => {
    expect(await searchModels('category=sedan')).toEqual(['Civic', 'Corolla']);
  });

  it('combines filters with AND', async () => {
    expect(await searchModels('make=toyota&category=suv')).toEqual(['RAV4']);
  });

  it('treats the price range as inclusive', async () => {
    expect(await searchModels('minPrice=2600000&maxPrice=3500000')).toEqual(['Civic', 'RAV4']);
  });

  it('supports only minPrice', async () => {
    expect(await searchModels('minPrice=3500000')).toEqual(['F-150', 'RAV4']);
  });

  it('supports only maxPrice', async () => {
    expect(await searchModels('maxPrice=2400000')).toEqual(['Corolla']);
  });

  it('returns 400 when minPrice is greater than maxPrice', async () => {
    const res = await request(app).get('/api/vehicles/search?minPrice=500&maxPrice=100').set(bearer(token));
    expect(res.status).toBe(400);
  });

  it('returns an empty page (not an error) when nothing matches', async () => {
    const res = await request(app).get('/api/vehicles/search?make=lamborghini').set(bearer(token));
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
    expect(res.body.pagination.total).toBe(0);
  });

  it('hides sold-out vehicles unless includeOutOfStock=true', async () => {
    expect(await searchModels('make=tesla')).toEqual([]);
    expect(await searchModels('make=tesla&includeOutOfStock=true')).toEqual(['Model 3']);
  });
});