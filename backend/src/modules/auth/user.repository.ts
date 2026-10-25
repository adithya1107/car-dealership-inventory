import { User } from '@prisma/client';
import { prisma } from '../../lib/prisma';

/** Data access for users. The only place that talks to Prisma about users. */
export class UserRepository {
  create(data: { email: string; passwordHash: string }): Promise<User> {
    return prisma.user.create({ data });
  }

  findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }

    async delete(id: string): Promise<void> {
    await prisma.vehicle.delete({ where: { id } });
  }
}