import type { GameState } from './typesCifras';

function distance(value: number, target: number): number {
    return Math.abs(value - target);
}

export function getBestValue(state: GameState): number {
    const { target } = state.challenge;

    return state.tiles
        .map((tile) => tile.value)
        .reduce((best, value) => {
            const isCloser = distance(value, target) < distance(best, target);
            const isTieButSmaller =
                distance(value, target) === distance(best, target) && value < best;

            return isCloser || isTieButSmaller ? value : best;
        });
}

export function calculateScore(target: number, value: number): number {
    const gap = distance(value, target);

    if (gap === 0) return 10;
    if (gap <= 5) return 7;
    if (gap <= 10) return 5;
    return 0;
}

// Each hint costs one point more than the one before: 1, 2 and 3.
export function nextHintCost(hintsUsed: number): number {
    return hintsUsed + 1;
}

// Points taken away for the hints used: 1 + 2 + 3
export function hintPenalty(hintsUsed: number): number {
    let total = 0;
    for (let hint = 0; hint < hintsUsed; hint++) {
        total += nextHintCost(hint);
    }
    return total;
}

// The final score after taking away the hints. It never goes below 0.
export function scoreWithHints(score: number, hintsUsed: number): number {
    return Math.max(0, score - hintPenalty(hintsUsed));
}