import { Prisma, Vehicle } from '@prisma/client';
import { prisma } from '../../../lib/prisma';
import {
  CreateVehicleInput,
  UpdateVehicleInput,
  VehicleSearchQuery,
} from './vehicle.schema';

function buildWhere(query: VehicleSearchQuery): Prisma.VehicleWhereInput {
  const where: Prisma.VehicleWhereInput = {};
  if (!query.includeOutOfStock) where.quantity = { gt: 0 };
  if (query.make) where.make = { contains: query.make, mode: 'insensitive' };
  if (query.model) where.model = { contains: query.model, mode: 'insensitive' };
  if (query.category) where.category = { contains: query.category, mode: 'insensitive' };
  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    where.price = { gte: query.minPrice, lte: query.maxPrice };
  }
  return where;
}

export class VehicleRepository {
  create(data: CreateVehicleInput): Promise<Vehicle> {
    return prisma.vehicle.create({ data });
  }

  async findMany(query: VehicleSearchQuery): Promise<{ items: Vehicle[]; total: number }> {
    const where = buildWhere(query);
    const [items, total] = await Promise.all([
      prisma.vehicle.findMany({
        where,
        orderBy: [{ make: 'asc' }, { model: 'asc' }, { id: 'asc' }],
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      prisma.vehicle.count({ where }),
    ]);
    return { items, total };
  }

  findById(id: string): Promise<Vehicle | null> {
    return prisma.vehicle.findUnique({ where: { id } });
  }

  update(id: string, data: UpdateVehicleInput): Promise<Vehicle> {
    return prisma.vehicle.update({ where: { id }, data });
  }

  async remove(id: string): Promise<void> {
    await prisma.vehicle.delete({ where: { id } });
  }

  /** Adds `delta` (may be negative) to stock. */
  adjustStock(id: string, delta: number): Promise<Vehicle> {
    return prisma.vehicle.update({
      where: { id },
      data: { quantity: { increment: delta } },
    });
  }

  async decrementIfAvailable(id: string, amount: number): Promise<boolean> {
    const result = await prisma.$runCommandRaw({
      update: 'Vehicle', // collection name = Prisma model name
      updates: [
        {
          q: { _id: { $oid: id }, quantity: { $gte: amount } },
          u: {
            $inc: { quantity: -amount },
            $set: { updatedAt: { $date: new Date().toISOString() } },
          },
        },
      ],
    });
    return result.nModified === 1;
  }
}