import jwt from 'jsonwebtoken';
import request from 'supertest';
import { app } from '../src/app';
import { closeDatabase, resetDatabase } from '../src/helpers/db';

const credentials = { email: 'jane@example.com', password: 'Passw0rd!123' };

beforeEach(async () => {
  await resetDatabase();
  await request(app).post('/api/auth/register').send(credentials);
});
afterAll(closeDatabase);

describe('POST /api/auth/login', () => {
  it('returns 200 with a signed JWT and the public user', async () => {
    const res = await request(app).post('/api/auth/login').send(credentials);

    expect(res.status).toBe(200);
    expect(res.body.user).toEqual({
      id: expect.any(String),
      email: credentials.email,
      role: 'USER',
    });
    const decoded = jwt.decode(res.body.token) as jwt.JwtPayload;
    expect(decoded.sub).toBe(res.body.user.id);
    expect(decoded.role).toBe('USER');
    expect(decoded.exp).toBeDefined();
  });

  it('accepts the email in any letter case', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ ...credentials, email: 'JANE@EXAMPLE.COM' });

    expect(res.status).toBe(200);
  });

  it('returns 401 INVALID_CREDENTIALS for a wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ ...credentials, password: 'WrongPassword1' });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('gives the same response for an unknown email (no user enumeration)', async () => {
    const wrongPassword = await request(app)
      .post('/api/auth/login')
      .send({ ...credentials, password: 'WrongPassword1' });
    const unknownEmail = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: 'Passw0rd!123' });

    expect(unknownEmail.status).toBe(401);
    expect(unknownEmail.body).toEqual(wrongPassword.body);
  });

  it('returns 400 when fields are missing', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: credentials.email });

    expect(res.status).toBe(400);
  });
});