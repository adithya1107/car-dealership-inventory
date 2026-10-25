/** Reads a required env var and fails loudly if it is missing. */
function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

// Getters are lazy so tests can set env vars before first use.
export const jwtConfig = {
  get secret(): string {
    return required('JWT_SECRET');
  },
  get expiresIn(): string {
    return process.env.JWT_EXPIRES_IN ?? '1h';
  },
};