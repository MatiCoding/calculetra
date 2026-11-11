import { describe, expect, it } from 'vitest';
import { findLongestWord } from './hintsLetras';

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