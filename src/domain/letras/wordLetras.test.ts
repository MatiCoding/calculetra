import { describe, expect, it } from 'vitest';
import { canBuild, normalizeWord } from './wordLetras';

const LETTERS = ['P', 'A', 'O', 'H', 'C', 'I', 'E', 'A', 'L'];

describe('normalizeWord', () => {
  it('turns the word into upper case', () => {
    expect(normalizeWord('chapela')).toBe('CHAPELA');
  });

  it('removes the accents', () => {
    expect(normalizeWord('camión')).toBe('CAMION');
    expect(normalizeWord('ÁRBOL')).toBe('ARBOL');
    expect(normalizeWord('pingüino')).toBe('PINGUINO');
  });

  it('keeps the Ñ', () => {
    expect(normalizeWord('niño')).toBe('NIÑO');
    expect(normalizeWord('AÑO')).toBe('AÑO');
  });

  it('keeps the Ñ when it is written as N plus a combining tilde', () => {
    expect(normalizeWord('niño')).toBe('NIÑO');
  });

  it('removes the spaces around the word', () => {
    expect(normalizeWord('  hola ')).toBe('HOLA');
  });
});

describe('canBuild', () => {
  it('accepts a word that only uses the letters of the day', () => {
    expect(canBuild('CHAPELA', LETTERS)).toBe(true);
    expect(canBuild('ALOPECIA', LETTERS)).toBe(true);
  });

  it('accepts a word that uses all the letters', () => {
    expect(canBuild('PALOHCIEA', LETTERS)).toBe(true);
  });

  it('rejects a word with a letter that is not available', () => {
    expect(canBuild('CASA', LETTERS)).toBe(false);
  });

  it('lets a letter be used as many times as it was drawn', () => {
    // there are two A
    expect(canBuild('AA', LETTERS)).toBe(true);
    expect(canBuild('AAA', LETTERS)).toBe(false);
  });

  it('does not use a letter twice when it was drawn once', () => {
    expect(canBuild('PAPA', LETTERS)).toBe(false);
  });

  it('accepts the empty word', () => {
    expect(canBuild('', LETTERS)).toBe(true);
  });

  it('does not change the letters it is given', () => {
    const letters = [...LETTERS];
    canBuild('CHAPELA', letters);

    expect(letters).toEqual(LETTERS);
  });

  it('treats Ñ and N as different letters', () => {
    expect(canBuild('AÑO', ['A', 'N', 'O'])).toBe(false);
    expect(canBuild('AÑO', ['A', 'Ñ', 'O'])).toBe(true);
  });
});
