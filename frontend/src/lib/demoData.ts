import type { Vehicle } from '../api/types';

const stamps = { createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' };

/** Sample cars for the public landing page; the real inventory needs a login. */
export const DEMO_VEHICLES: Vehicle[] = [
  { id: 'demo-1', make: 'Toyota', model: 'Corolla', category: 'Sedan', price: 2_400_000, quantity: 8, ...stamps },
  { id: 'demo-2', make: 'Honda', model: 'Civic', category: 'Sedan', price: 2_600_000, quantity: 6, ...stamps },
  { id: 'demo-3', make: 'Toyota', model: 'RAV4', category: 'SUV', price: 3_500_000, quantity: 5, ...stamps },
  { id: 'demo-4', make: 'Ford', model: 'F-150', category: 'Truck', price: 4_500_000, quantity: 4, ...stamps },
  { id: 'demo-5', make: 'Tesla', model: 'Model 3', category: 'Electric', price: 4_000_000, quantity: 3, ...stamps },
  { id: 'demo-6', make: 'Tesla', model: 'Model Y', category: 'Electric', price: 4_800_000, quantity: 2, ...stamps },
];