import { z } from 'zod';
import { Prisma } from '@prisma/client';

const text = z.string().trim().min(1).max(100);

// Price is an integer number of cents.
const fields = {
  make: text,
  model: text,
  category: text,
  price: z.number().int().positive(),
  quantity: z.number().int().nonnegative(),
};

export const createVehicleSchema = z.object({
  ...fields,
  quantity: fields.quantity.default(0),
});

/** Partial update: any subset of fields, but at least one. */
export const updateVehicleSchema = z
  .object(fields)
  .partial()
  .refine((data) => Object.keys(data).length > 0, { message: 'At least one field is required' });

export const listQuerySchema = z.object({
  includeOutOfStock: z
    .enum(['true', 'false'])
    .default('false')
    .transform((value) => value === 'true'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
export const searchQuerySchema = listQuerySchema
  .extend({
    make: text.optional(),
    model: text.optional(),
    category: text.optional(),
    minPrice: z.coerce.number().int().nonnegative().optional(),
    maxPrice: z.coerce.number().int().nonnegative().optional(),
  })
  .refine(
    (q) => q.minPrice === undefined || q.maxPrice === undefined || q.minPrice <= q.maxPrice,
    { message: 'minPrice must be less than or equal to maxPrice', path: ['minPrice'] },
  );

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


export type CreateVehicleInput = z.infer<typeof createVehicleSchema>;
export type UpdateVehicleInput = z.infer<typeof updateVehicleSchema>;
export type VehicleListQuery = z.infer<typeof listQuerySchema>;
export type VehicleSearchQuery = z.infer<typeof searchQuerySchema>;
