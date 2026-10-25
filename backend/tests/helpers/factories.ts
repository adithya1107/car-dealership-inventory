import { prisma } from '../../src/lib/prisma';

interface VehicleFields {
  make: string;
  model: string;
  category: string;
  price: number;
  quantity: number;
}

export const vehicleData = (overrides: Partial<VehicleFields> = {}): VehicleFields => ({
  make: 'Toyota',
  model: 'Corolla',
  category: 'Sedan',
  price: 2_400_000, // cents
  quantity: 5,
  ...overrides,
});

/** Inserts a vehicle directly (fast arrange step, bypasses the API). */
export const createVehicle = (overrides: Partial<VehicleFields> = {}) =>
  prisma.vehicle.create({ data: vehicleData(overrides) });