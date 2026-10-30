import { describe, expect, it, vi } from 'vitest';
import { DICTIONARY_URL, isInDictionary, loadDictionary, parseDictionary } from './dictionaryLetras';

describe('parseDictionary', () => {
  it('reads one word per line', () => {
    expect(parseDictionary('CASA\nPERRO\nNIÑO\n')).toEqual(new Set(['CASA', 'PERRO', 'NIÑO']));
  });

  it('ignores empty lines', () => {
    expect(parseDictionary('\nCASA\n\n\nPERRO\n').size).toBe(2);
  });

  it('works with Windows line endings', () => {
    expect(parseDictionary('CASA\r\nPERRO\r\n')).toEqual(new Set(['CASA', 'PERRO']));
  });

  it('gives an empty dictionary for an empty file', () => {
    expect(parseDictionary('').size).toBe(0);
  });
});

describe('isInDictionary', () => {
  const dictionary = new Set(['CHAPELA', 'ALOPECIA']);

  it('accepts a word in the dictionary', () => {
    expect(isInDictionary('ALOPECIA', dictionary)).toBe(true);
  });

  it('rejects a word that is not in the dictionary', () => {
    expect(isInDictionary('PALOHCIEA', dictionary)).toBe(false);
  });
});

describe('loadDictionary', () => {
  it('downloads the word list and reads it', async () => {
    const fakeFetch = vi.fn(async () => new Response('CHAPELA\nALOPECIA\n'));

    const dictionary = await loadDictionary(fakeFetch);

    expect(fakeFetch).toHaveBeenCalledWith(DICTIONARY_URL);
    expect(dictionary).toEqual(new Set(['CHAPELA', 'ALOPECIA']));
  });

  it('fails when the word list cannot be downloaded', async () => {
    const fakeFetch = vi.fn(async () => new Response('Not found', { status: 404 }));

    await expect(loadDictionary(fakeFetch)).rejects.toThrow('404');
  });
});
