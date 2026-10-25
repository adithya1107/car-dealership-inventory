import request from 'supertest';
import { app } from '../src/app';

describe('GET /api/health', () => {
  it('responds with 200 and a status of "ok"', async () => {
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });
});