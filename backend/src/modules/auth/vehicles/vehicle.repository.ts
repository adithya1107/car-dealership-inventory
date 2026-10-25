import { Prisma, Vehicle } from '@prisma/client';
import { prisma } from '../../../lib/prisma';
import { CreateVehicleInput, VehicleListQuery } from './vehicle.schema';

function buildWhere(query: VehicleListQuery): Prisma.VehicleWhereInput {
  const where: Prisma.VehicleWhereInput = {};
  if (!query.includeOutOfStock) where.quantity = { gt: 0 };
  return where;
}

/** Data access for vehicles. */
export class VehicleRepository {
  create(data: CreateVehicleInput): Promise<Vehicle> {
    return prisma.vehicle.create({ data });
  }

  async findMany(query: VehicleListQuery): Promise<{ items: Vehicle[]; total: number }> {
    const where = buildWhere(query);
    const [items, total] = await prisma.$transaction([
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
}