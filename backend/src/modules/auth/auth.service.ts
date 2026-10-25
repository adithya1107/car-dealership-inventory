import bcrypt from 'bcrypt';
import { Prisma, User } from '@prisma/client';
import { ConflictError } from '../../errors/AppError';
import { RegisterInput } from './auth.schema';
import { UserRepository } from './user.repository';
import jwt, { SignOptions } from 'jsonwebtoken';
import { jwtConfig } from '../../config/env';
import { UnauthorizedError } from '../../errors/AppError';
import { LoginInput } from './auth.schema';

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

    async login(input: LoginInput): Promise<{ token: string; user: PublicUser }> {
    const user = await this.users.findByEmail(input.email);
    const passwordMatches = user !== null && (await bcrypt.compare(input.password, user.passwordHash));

    // Same message for "no such user" and "wrong password"
    if (!user || !passwordMatches) {
      throw new UnauthorizedError('Invalid email or password', 'INVALID_CREDENTIALS');
    }

    const token = jwt.sign({ sub: user.id, role: user.role }, jwtConfig.secret, {
      expiresIn: jwtConfig.expiresIn as SignOptions['expiresIn'],
    });
    return { token, user: toPublicUser(user) };
  }
}