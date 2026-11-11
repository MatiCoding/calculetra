import { LETTERS_PER_CHALLENGE } from './challengeLetras';

// One point per letter; a word that uses all the letters scores double.
export function calculateScore(word: string, isValid: boolean): number {
    if (!isValid) return 0;
    if (word.length === LETTERS_PER_CHALLENGE) return word.length * 2;
    return word.length;
}

export const HINT_COST_LETRAS = 1;

// Points taken away for the hints used: 1 per hint.
export function hintPenalty(hintsUsed: number): number {
    return hintsUsed * HINT_COST_LETRAS;
}

// The final score after taking away the hints. It never goes below 0.
export function scoreWithHints(score: number, hintsUsed: number): number{
    return Math.max(0, score - hintPenalty(hintsUsed));
}