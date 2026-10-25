import { getTestDatabaseUrl } from './testDbUrl';

process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = getTestDatabaseUrl();
process.env.JWT_SECRET = 'test-secret-do-not-use-in-production';
process.env.JWT_EXPIRES_IN = '1h';