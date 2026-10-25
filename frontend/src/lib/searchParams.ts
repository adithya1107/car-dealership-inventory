import type { SearchParams } from '../api/types';
import { dollarsToCents } from './format';

export const PAGE_SIZE = 12;

/** Reads the inventory page's URL (prices in dollars) into an API query (prices in cents). */
export function paramsFromUrl(sp: URLSearchParams): SearchParams {
  const number = (key: string): number | undefined => {
    const raw = sp.get(key);
    if (!raw) return undefined;
    const n = Number(raw);
    return Number.isFinite(n) && n >= 0 ? n : undefined;
  };
  const min = number('minPrice');
  const max = number('maxPrice');

  return {
    make: sp.get('make') || undefined,
    model: sp.get('model') || undefined,
    category: sp.get('category') || undefined,
    minPrice: min !== undefined ? dollarsToCents(min) : undefined,
    maxPrice: max !== undefined ? dollarsToCents(max) : undefined,
    // The grid shows sold-out cars (with a disabled button) unless "in stock only" is ticked.
    includeOutOfStock: sp.get('inStock') !== '1',
    page: Math.max(1, Math.floor(number('page') ?? 1)),
    limit: PAGE_SIZE,
  };
}