import { Vehicle } from '@prisma/client';
import { VehicleRepository } from './vehicle.repository';
import {
  CreateVehicleInput,
  UpdateVehicleInput,
  VehicleSearchQuery,
} from './vehicle.schema';
import { NotFoundError, OutOfStockError } from '../../../errors/AppError';

export interface Page<T> {
  data: T[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export class VehicleService {
  constructor(private readonly vehicles = new VehicleRepository()) {}

  create(input: CreateVehicleInput): Promise<Vehicle> {
    return this.vehicles.create(input);
  }

  async find(query: VehicleSearchQuery): Promise<Page<Vehicle>> {
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
  async update(id: string, input: UpdateVehicleInput): Promise<Vehicle> {
    await this.getOrThrow(id);
    return this.vehicles.update(id, input);
  }

  async remove(id: string): Promise<void> {
    await this.getOrThrow(id);
    await this.vehicles.remove(id);
  }

  async purchase(id: string, amount: number): Promise<Vehicle> {
    const vehicle = await this.getOrThrow(id);
    if (vehicle.quantity < amount) throw new OutOfStockError();
    return this.vehicles.adjustStock(id, -amount);
  }

  async restock(id: string, amount: number): Promise<Vehicle> {
    await this.getOrThrow(id);
    return this.vehicles.adjustStock(id, amount);
  }

  private async getOrThrow(id: string): Promise<Vehicle> {
    const vehicle = await this.vehicles.findById(id);
    if (!vehicle) throw new NotFoundError('Vehicle not found');
    return vehicle;
  }
}