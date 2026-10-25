import { prisma } from '../../src/lib/prisma';

/** Wipes all tables so every test starts from a clean slate. */
export async function resetDatabase(): Promise<void> {
  await prisma.vehicle.deleteMany();
  await prisma.user.deleteMany();
}

export async function closeDatabase(): Promise<void> {
  await prisma.$disconnect();
}