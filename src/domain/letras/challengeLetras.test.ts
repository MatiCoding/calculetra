import { describe, expect, it } from 'vitest';
import { CONSONANTS, VOWELS, pickWeighted } from './challengeLetras';

describe('letter bags', () => {
  it('has exactly the five vowels in the vowel bag', () => {
    expect(Object.keys(VOWELS).sort()).toEqual(['A', 'E', 'I', 'O', 'U']);
  });

  it('has no vowels in the consonant bag', () => {
    for (const vowel of Object.keys(VOWELS)) {
      expect(CONSONANTS).not.toHaveProperty(vowel);
    }
  });

  it('includes the Ñ', () => {
    expect(CONSONANTS).toHaveProperty('Ñ');
  });

  it('only has positive whole weights', () => {
    for (const weight of [...Object.values(VOWELS), ...Object.values(CONSONANTS)]) {
      expect(Number.isInteger(weight)).toBe(true);
      expect(weight).toBeGreaterThan(0);
    }
  });
});

describe('pickWeighted', () => {
  const bag = { A: 1, B: 2, C: 1 }; // total 4: A [0, 1), B [1, 3), C [3, 4)

  it('picks the first letter when random gives 0', () => {
    expect(pickWeighted(bag, () => 0)).toBe('A');
  });

  it('picks the last letter when random gives almost 1', () => {
    expect(pickWeighted(bag, () => 0.9999)).toBe('C');
  });

  it('gives each letter a share as big as its weight', () => {
    expect(pickWeighted(bag, () => 0.24)).toBe('A'); // 0.96
    expect(pickWeighted(bag, () => 0.25)).toBe('B'); // 1
    expect(pickWeighted(bag, () => 0.74)).toBe('B'); // 2.96
    expect(pickWeighted(bag, () => 0.75)).toBe('C'); // 3
  });

  it('always returns a letter from the bag', () => {
    let state = 0;
    const random = () => (state = (state + 0.137) % 1);

    for (let i = 0; i < 50; i++) {
      expect(Object.keys(CONSONANTS)).toContain(pickWeighted(CONSONANTS, random));
    }
  });
});