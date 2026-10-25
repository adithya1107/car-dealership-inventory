import request from 'supertest';
import { app } from '../src/app';
import { prisma } from '../src/lib/prisma';
import { bearer, createAuthenticatedUser } from './helpers/auth';
import { closeDatabase, resetDatabase } from '../src/helpers/db';
import { createVehicle } from './helpers/factories';

beforeEach(resetDatabase);
afterAll(closeDatabase);

describe('concurrent purchases', () => {
  it('never oversells: 5 parallel purchases against stock of 3 yield exactly 3 sales', async () => {
    const vehicle = await createVehicle({ quantity: 3 });
    const { token } = await createAuthenticatedUser('USER');

    const responses = await Promise.all(
      Array.from({ length: 5 }, () =>
        request(app).post(`/api/vehicles/${vehicle.id}/purchase`).set(bearer(token)),
      ),
    );

    const statuses = responses.map((r) => r.status);
    expect(statuses.filter((s) => s === 200)).toHaveLength(3);
    expect(statuses.filter((s) => s === 409)).toHaveLength(2);

    const after = await prisma.vehicle.findUniqueOrThrow({ where: { id: vehicle.id } });
    expect(after.quantity).toBe(0);
  });
});