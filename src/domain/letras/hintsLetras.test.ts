import { describe, expect, it } from 'vitest';
import { MAX_HINTS_LETRAS, findLongestWord, getHintPositions } from './hintsLetras';

const LETTERS = ['C', 'E', 'N', 'T', 'A', 'U', 'R', 'O', 'S'];

describe('findLongestWord', () => {
  it('finds the longest word that can be built with the letters', () => {
    const dictionary = new Set(['ROTA', 'CENTAUROS', 'CUENTO']);
    expect(findLongestWord(LETTERS, dictionary)).toBe('CENTAUROS');
  });

  it('skips words that need letters that are not there', () => {
    // CANTAR needs two A and ZAPATO needs a Z.
    const dictionary = new Set(['CANTAR', 'ZAPATO', 'ROTA']);
    expect(findLongestWord(LETTERS, dictionary)).toBe('ROTA');
  });

  it('picks the first one in alphabetical order on a tie', () => {
    const dictionary = new Set(['TRUENO', 'SECTOR', 'CUENTO']);
    expect(findLongestWord(LETTERS, dictionary)).toBe('CUENTO');
  });

  it('puts the Ñ after the N and before the O, like in Spanish', () => {
    const dictionary = new Set(['ASO', 'AÑO']);
    expect(findLongestWord(['A', 'Ñ', 'O', 'S'], dictionary)).toBe('AÑO');
  });

  it('returns null when no word can be built', () => {
    const dictionary = new Set(['ZAPATO', 'JIRAFA']);
    expect(findLongestWord(LETTERS, dictionary)).toBeNull();
  });

  it('returns null with an empty dictionary', () => {
    expect(findLongestWord(LETTERS, new Set())).toBeNull();
  });
});

describe('getHintPositions', () => {
  const DAY = new Date('2026-11-10T12:00:00Z');

  it('gives 3 positions', () => {
    expect(getHintPositions(DAY, 9)).toHaveLength(MAX_HINTS_LETRAS);
  });

  it('never repeats a position', () => {
    const positions = getHintPositions(DAY, 9);
    expect(new Set(positions).size).toBe(positions.length);
  });

  it('only gives positions inside the word', () => {
    for (const position of getHintPositions(DAY, 5)) {
      expect(Number.isInteger(position)).toBe(true);
      expect(position).toBeGreaterThanOrEqual(0);
      expect(position).toBeLessThan(5);
    }
  });

  it('gives the same positions all day long', () => {
    const morning = new Date('2026-11-10T07:00:00Z');
    const night = new Date('2026-11-10T21:00:00Z');
    expect(getHintPositions(morning, 9)).toEqual(getHintPositions(night, 9));
  });

  it('changes the positions from one day to another', () => {
    const days = ['2026-11-10', '2026-11-11', '2026-11-12', '2026-11-13'].map(
      (day) => getHintPositions(new Date(`${day}T12:00:00Z`), 9).join(','),
    );
    expect(new Set(days).size).toBeGreaterThan(1);
  });

  it('gives fewer positions when the word is shorter than the hints', () => {
    const positions = getHintPositions(DAY, 2);
    expect([...positions].sort()).toEqual([0, 1]);
  });

  it('gives no positions when there is no word', () => {
    expect(getHintPositions(DAY, 0)).toEqual([]);
  });
});