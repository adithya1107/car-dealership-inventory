import { z } from 'zod';

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

export const purchaseSchema = z.object({
    quantity: z.number().int().positive().max(100).default(1),
});

export const restockSchema = z.object({
    quantity: z.number().int().positive().max(10_000),
});

export type CreateVehicleInput = z.infer<typeof createVehicleSchema>;
export type UpdateVehicleInput = z.infer<typeof updateVehicleSchema>;
export type VehicleListQuery = z.infer<typeof listQuerySchema>;
export type VehicleSearchQuery = z.infer<typeof searchQuerySchema>;
