import { execSync } from 'child_process';
import { getTestDatabaseUrl } from './testDbUrl';

export default async function globalSetup() {
  execSync('npx prisma db push --skip-generate', {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: getTestDatabaseUrl() },
  });
}