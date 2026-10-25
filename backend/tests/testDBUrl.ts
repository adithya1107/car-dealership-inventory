import dotenv from 'dotenv';

dotenv.config();

/** Returns the test database URL, refusing to run against anything that
 *  doesn't look like a test database. */
export function getTestDatabaseUrl(): string {
  const url = process.env.TEST_DATABASE_URL;
  if (!url) {
    throw new Error('TEST_DATABASE_URL is not set. Add it to backend/.env');
  }
  const dbName = url.split('?')[0].split('/').pop() ?? '';
  if (!dbName.toLowerCase().includes('test')) {
    throw new Error(
      `Refusing to run tests: database name "${dbName}" does not contain "test".`,
    );
  }
  return url;
}