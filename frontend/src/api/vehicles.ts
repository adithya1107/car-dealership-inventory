import { api } from './client';
import type { Page, SearchParams, Vehicle, VehicleInput } from './types';

/** Search with no filters behaves like "list", so the UI uses one endpoint. */
export async function searchVehicles(params: SearchParams): Promise<Page<Vehicle>> {
  const { data } = await api.get<Page<Vehicle>>('/vehicles/search', { params });
  return data;
}

export async function createVehicle(input: VehicleInput): Promise<Vehicle> {
  const { data } = await api.post<Vehicle>('/vehicles', input);
  return data;
}

export async function updateVehicle(id: string, input: Partial<VehicleInput>): Promise<Vehicle> {
  const { data } = await api.put<Vehicle>(`/vehicles/${id}`, input);
  return data;
}

export async function deleteVehicle(id: string): Promise<void> {
  await api.delete(`/vehicles/${id}`);
}

export async function purchaseVehicle(id: string, quantity = 1): Promise<Vehicle> {
  const { data } = await api.post<Vehicle>(`/vehicles/${id}/purchase`, { quantity });
  return data;
}

export async function restockVehicle(id: string, quantity: number): Promise<Vehicle> {
  const { data } = await api.post<Vehicle>(`/vehicles/${id}/restock`, { quantity });
  return data;
}