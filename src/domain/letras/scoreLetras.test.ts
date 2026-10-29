import { describe, expect, it } from 'vitest';
import { calculateScore } from './scoreLetras';

describe('calculateScore', () => {
  it('gives one point per letter for a valid word', () => {
    expect(calculateScore('CHAPELA', true)).toBe(7);
    expect(calculateScore('ALOPECIA', true)).toBe(8);
    expect(calculateScore('PEZ', true)).toBe(3);
  });

  it('gives double points (18) when the word uses all 9 letters', () => {
    expect(calculateScore('CERNISTEF', true)).toBe(18);
  });

  it('gives 0 points when the word is not in the dictionary', () => {
    expect(calculateScore('PALOHCIEA', false)).toBe(0);
    expect(calculateScore('HCI', false)).toBe(0);
  });
});
