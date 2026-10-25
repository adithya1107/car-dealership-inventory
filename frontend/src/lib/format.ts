const usdWhole = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const usdWithCents = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Backend prices are integer cents; this renders them as "$36,620". */
export const formatPrice = (cents: number): string =>
  (cents % 100 === 0 ? usdWhole : usdWithCents).format(cents / 100);

export const dollarsToCents = (dollars: number): number => Math.round(dollars * 100);

export const centsToDollars = (cents: number): number => cents / 100;