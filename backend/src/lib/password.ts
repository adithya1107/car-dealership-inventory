import bcrypt from 'bcrypt';

// Low cost in tests keeps the suite fast; high cost in real use.
const ROUNDS = process.env.NODE_ENV === 'test' ? 4 : 12;

export const hashPassword = (plain: string): Promise<string> => bcrypt.hash(plain, ROUNDS);

export const verifyPassword = (plain: string, hash: string): Promise<boolean> =>
  bcrypt.compare(plain, hash);