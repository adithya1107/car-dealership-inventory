import bcrypt from 'bcrypt';
import { Prisma, User } from '@prisma/client';
import { ConflictError } from '../../errors/AppError';
import { RegisterInput } from './auth.schema';
import { UserRepository } from './user.repository';

export interface PublicUser {
  id: string;
  email: string;
  role: string;
}

const toPublicUser = (user: User): PublicUser => ({
  id: user.id,
  email: user.email,
  role: user.role,
});

export class AuthService {
  constructor(private readonly users = new UserRepository()) {}

  async register(input: RegisterInput): Promise<PublicUser> {
    const passwordHash = await bcrypt.hash(input.password, 10);
    try {
      const user = await this.users.create({ email: input.email, passwordHash });
      return toPublicUser(user);
    } catch (err) {
      // P2002 = unique constraint violation (race-safe duplicate detection)
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new ConflictError('Email is already registered', 'EMAIL_ALREADY_REGISTERED');
      }
      throw err;
    }
  }
}