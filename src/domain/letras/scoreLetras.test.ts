import { describe, expect, it } from 'vitest';
import { calculateScore, nextHintCost, scoreWithHints } from './scoreLetras';

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

describe('nextHintCost', () => {
  it('costs one point more each time', () => {
    expect(nextHintCost(0)).toBe(1);
    expect(nextHintCost(1)).toBe(2);
    expect(nextHintCost(2)).toBe(3);
  });
});

describe('scoreWithHints', () => {
  it('keeps the score without hints', () => {
    expect(scoreWithHints(7, 0)).toBe(7);
  });

  it('takes the hints away from the score', () => {
    expect(scoreWithHints(7, 2)).toBe(4);
    expect(scoreWithHints(18, 3)).toBe(12);
  });

  it('never goes below 0', () => {
    expect(scoreWithHints(0, 3)).toBe(0);
    expect(scoreWithHints(5, 3)).toBe(0);
  });
});
