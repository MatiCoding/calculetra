import { describe, expect, it } from 'vitest';
import { CONSONANTS, VOWELS, generateLetters, getDailyLetters, pickWeighted } from './challengeLetras';
import { createRandom } from '../shared/random';

function countVowels(letters: Array<string>): number {
  return letters.filter((letter) => letter in VOWELS).length;
}

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

describe('generateLetters', () => {
  it('gives 9 letters', () => {
    expect(generateLetters(createRandom(1))).toHaveLength(9);
  });

  it('gives between 3 and 5 vowels and the rest consonants', () => {
    for (let seed = 0; seed < 200; seed++) {
      const letters = generateLetters(createRandom(seed));

      expect(countVowels(letters)).toBeGreaterThanOrEqual(3);
      expect(countVowels(letters)).toBeLessThanOrEqual(5);
      for (const letter of letters) {
        expect(letter in VOWELS || letter in CONSONANTS).toBe(true);
      }
    }
  });

  it('uses every vowel count from 3 to 5 on some day', () => {
    const counts = new Set<number>();
    for (let seed = 0; seed < 200; seed++) {
      counts.add(countVowels(generateLetters(createRandom(seed))));
    }

    expect([...counts].sort()).toEqual([3, 4, 5]);
  });

  it('does not always put the vowels first', () => {
    const vowelsFirst = (letters: Array<string>) =>
      letters.slice(0, countVowels(letters)).every((letter) => letter in VOWELS);
    let alwaysFirst = true;
    for (let seed = 0; seed < 50; seed++) {
      if (!vowelsFirst(generateLetters(createRandom(seed)))) alwaysFirst = false;
    }

    expect(alwaysFirst).toBe(false);
  });

  it('gives the same letters for the same seed', () => {
    expect(generateLetters(createRandom(42))).toEqual(generateLetters(createRandom(42)));
  });
});

describe('getDailyLetters', () => {
  it('gives the same letters all day in Madrid', () => {
    // 00:30 and 23:30 in Madrid on 14 October 2026
    expect(getDailyLetters(new Date('2026-10-13T22:30:00Z'))).toEqual(
      getDailyLetters(new Date('2026-10-14T21:30:00Z')),
    );
  });

  it('gives different letters the next day', () => {
    expect(getDailyLetters(new Date('2026-10-14T10:00:00Z'))).not.toEqual(
      getDailyLetters(new Date('2026-10-15T10:00:00Z')),
    );
  });
});
