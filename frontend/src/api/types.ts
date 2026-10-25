export type Role = 'USER' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  role: Role;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  category: string;
  price: number; // integer cents
  quantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface VehicleInput {
  make: string;
  model: string;
  category: string;
  price: number; // integer cents
  quantity: number;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Page<T> {
  data: T[];
  pagination: Pagination;
}

/** Query accepted by GET /vehicles/search. Prices are in cents. */
export interface SearchParams {
  make?: string;
  model?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  includeOutOfStock?: boolean;
  page?: number;
  limit?: number;
}