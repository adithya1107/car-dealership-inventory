import { z } from 'zod';

const email = z.string().trim().toLowerCase().email();

export const registerSchema = z.object({
  email,
  // bcrypt only uses the first 72 bytes, so cap the length
  password: z.string().min(8).max(72),
});

export const loginSchema = z.object({
  email,
  password: z.string().min(1),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;