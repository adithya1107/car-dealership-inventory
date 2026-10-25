import { describe, expect, it } from 'vitest';
import { dollarsToCents, formatPrice } from './format';

describe('formatPrice', () => {
  it('formats cents as whole dollars when there are no cents', () => {
    expect(formatPrice(3_662_000)).toBe('$36,620');
  });

  it('keeps the cents when present', () => {
    expect(formatPrice(3_662_050)).toBe('$36,620.50');
  });
});

describe('dollarsToCents', () => {
  it('rounds away floating point artefacts', () => {
    expect(dollarsToCents(19.99)).toBe(1999);
  });
});