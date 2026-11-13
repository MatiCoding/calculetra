import { LETTERS_PER_CHALLENGE } from './challengeLetras';

// One point per letter; a word that uses all the letters scores double.
export function calculateScore(word: string, isValid: boolean): number {
    if (!isValid) return 0;
    if (word.length === LETTERS_PER_CHALLENGE) return word.length * 2;
    return word.length;
}

// Each hint costs one point more than the one before: 1, 2 and 3.
export function nextHintCost(hintsUsed: number): number {
    return hintsUsed + 1;
}

// Points taken away for the hints used: 1 + 2 + 3...
export function hintPenalty(hintsUsed: number): number {
    let total = 0;
    for (let hint = 0; hint < hintsUsed; hint++) {
        total += nextHintCost(hint);
    }
    return total;
}

// The final score after taking away the hints. It never goes below 0.
export function scoreWithHints(score: number, hintsUsed: number): number{
    return Math.max(0, score - hintPenalty(hintsUsed));
}