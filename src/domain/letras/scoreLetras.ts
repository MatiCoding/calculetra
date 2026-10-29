import { LETTERS_PER_CHALLENGE } from './challengeLetras';

// One point per letter; a word that uses all the letters scores double.
export function calculateScore(word: string, isValid: boolean): number {
    if (!isValid) return 0;
    if (word.length === LETTERS_PER_CHALLENGE) return word.length * 2;
    return word.length;
}