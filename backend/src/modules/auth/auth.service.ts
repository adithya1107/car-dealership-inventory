import { Prisma, User } from '@prisma/client';
import { ConflictError, UnauthorizedError } from '../../errors/AppError';
import { hashPassword, verifyPassword } from '../../lib/password';
import { signToken } from '../../lib/token';
import { LoginInput, RegisterInput } from './auth.schema';
import { Role } from './roles';
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
    const passwordHash = await hashPassword(input.password);
    try {
      return toPublicUser(await this.users.create({ email: input.email, passwordHash }));
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new ConflictError('Email is already registered', 'EMAIL_ALREADY_REGISTERED');
      }
      throw err;
    }
  }

  async login(input: LoginInput): Promise<{ token: string; user: PublicUser }> {
    const user = await this.users.findByEmail(input.email);
    const valid = user !== null && (await verifyPassword(input.password, user.passwordHash));
    if (!user || !valid) {
      throw new UnauthorizedError('Invalid email or password', 'INVALID_CREDENTIALS');
    }
    const token = signToken({ sub: user.id, role: user.role as Role });
    return { token, user: toPublicUser(user) };
  }
}