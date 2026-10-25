import { Vehicle } from '@prisma/client';
import { VehicleRepository } from './vehicle.repository';
import { CreateVehicleInput, VehicleListQuery } from './vehicle.schema';

export interface Page<T> {
  data: T[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export class VehicleService {
  constructor(private readonly vehicles = new VehicleRepository()) {}

  create(input: CreateVehicleInput): Promise<Vehicle> {
    return this.vehicles.create(input);
  }

  async find(query: VehicleListQuery): Promise<Page<Vehicle>> {
    const { items, total } = await this.vehicles.findMany(query);
    return {
      data: items,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }
}