import { describe, expect, it } from 'vitest';
import { createRandom, hashString } from './random';

function take(random: () => number, count: number): number[] {
  return Array.from({ length: count }, () => random());
}

describe('hashString', () => {
  it('returns the same number for the same text', () => {
    expect(hashString('2026-10-13')).toBe(hashString('2026-10-13'));
  });

  it('returns different numbers for different dates', () => {
    expect(hashString('2026-10-13')).not.toBe(hashString('2026-10-14'));
  });

  it('returns a non-negative 32-bit integer', () => {
    const hash = hashString('2026-10-13');

    expect(Number.isInteger(hash)).toBe(true);
    expect(hash).toBeGreaterThanOrEqual(0);
    expect(hash).toBeLessThan(2 ** 32);
  });
});

describe('createRandom', () => {
  it('gives the same sequence for the same seed', () => {
    expect(take(createRandom(42), 10)).toEqual(take(createRandom(42), 10));
  });

  it('gives different sequences for different seeds', () => {
    expect(take(createRandom(1), 10)).not.toEqual(take(createRandom(2), 10));
  });

  it('does not repeat the same value on every call', () => {
    const values = take(createRandom(42), 10);

    expect(new Set(values).size).toBeGreaterThan(1);
  });

  it('returns values in [0, 1)', () => {
    const values = take(createRandom(hashString('2026-10-13')), 1000);

    for (const value of values) {
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });
});